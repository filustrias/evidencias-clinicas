// src/lib/epi.ts
//
// Cálculos epidemiológicos a partir de uma tabela 2×2.
// Usado pelos componentes da aba "Números" para preencher campos
// que o artigo eventualmente não reporta diretamente (RR, OR, etc).

export interface Table2x2 {
  intervention: { events: number; no_event: number };
  comparator: { events: number; no_event: number };
}

export interface EpiResults {
  // Riscos absolutos
  riskIntervention: number;     // proporção de eventos no braço de intervenção (0–1)
  riskComparator: number;       // proporção de eventos no braço comparador (0–1)
  totalIntervention: number;
  totalComparator: number;

  // Medidas de associação
  riskRelative: number;         // RR
  oddsRatio: number;            // OR
  riskDifference: number;       // RR absoluto, em pontos percentuais (pode ser negativo)

  // Mudança relativa
  relativeRiskChange: number;   // (Ri − Rc) / Rc, em %; positivo = aumento, negativo = redução

  // NNT / NNH (com base na diferença absoluta)
  // NNT é positivo quando a intervenção reduz o risco (intervenção melhor)
  // NNH é positivo quando a intervenção aumenta o risco (intervenção pior)
  nnt: number | null;           // null se a diferença não favorece a intervenção
  nnh: number | null;           // null se a diferença não desfavorece a intervenção
}

export function calcEpi(table: Table2x2): EpiResults {
  const eI = table.intervention.events;
  const nI = eI + table.intervention.no_event;
  const eC = table.comparator.events;
  const nC = eC + table.comparator.no_event;

  const rI = eI / nI;
  const rC = eC / nC;

  const riskRelative = rI / rC;

  // Odds Ratio com correção para zeros
  const a = eI || 0.5;
  const b = (nI - eI) || 0.5;
  const c = eC || 0.5;
  const d = (nC - eC) || 0.5;
  const oddsRatio = (a * d) / (b * c);

  // Diferença absoluta em pontos percentuais
  const riskDifference = (rI - rC) * 100;

  const relativeRiskChange = ((rI - rC) / rC) * 100;

  // NNT/NNH
  const absDiff = Math.abs(rI - rC);
  let nnt: number | null = null;
  let nnh: number | null = null;
  if (absDiff > 0) {
    const nn = Math.ceil(1 / absDiff);
    if (rI < rC) nnt = nn;       // intervenção reduziu o risco
    else nnh = nn;               // intervenção aumentou o risco
  }

  return {
    riskIntervention: rI,
    riskComparator: rC,
    totalIntervention: nI,
    totalComparator: nC,
    riskRelative,
    oddsRatio,
    riskDifference,
    relativeRiskChange,
    nnt,
    nnh,
  };
}

// Formatadores PT-BR
// O JS nativo só aceita ponto. Estas funções convertem para vírgula decimal.

export function fmtNumber(n: number, decimals = 2): string {
  return n.toFixed(decimals).replace('.', ',');
}

export function fmtSigned(n: number, decimals = 1, suffix = ''): string {
  const formatted = fmtNumber(Math.abs(n), decimals);
  const sign = n > 0 ? '+' : (n < 0 ? '−' : '');
  return `${sign}${formatted}${suffix}`;
}

export function fmtCI(ci: [number, number], decimals = 2): string {
  return `${fmtNumber(ci[0], decimals)} – ${fmtNumber(ci[1], decimals)}`;
}

export function fmtPctSimple(n: number, decimals = 1): string {
  return `${fmtNumber(n, decimals)}%`;
}

// ----------------------------------------------------------------------
// Forest plot — escolha da estatística a plotar
// ----------------------------------------------------------------------
//
// Regra de prioridade (a primeira que aparecer em QUALQUER outcome ou
// subgrupo do report vence):
//
//   1. hazard_ratio   → escala log, neutro = 1
//   2. risk_relative  → escala log, neutro = 1
//   3. odds_ratio     → escala log, neutro = 1
//   4. risk_difference → escala linear (pp), neutro = 0
//   5. calc_risk_difference → fallback: calcula DAR + IC Wald a partir
//                              da tabela 2×2 do outcome. Subgrupos sem
//                              risk_difference são puladas neste modo.
//
// O título do gráfico, a escala e a linha de neutralidade adaptam à
// estatística escolhida. Linhas que não tiverem o valor escolhido são
// puladas no plot (não há conversão silenciosa entre estatísticas).

export type ForestStatistic =
  | 'hazard_ratio'
  | 'risk_relative'
  | 'odds_ratio'
  | 'risk_difference'
  | 'calc_risk_difference';

export interface ForestStatisticInfo {
  key: ForestStatistic;
  label: string;
  scale: 'log' | 'linear';
  neutralValue: number;
  ciKey: string;
}

export const FOREST_STATISTIC_INFO: Record<ForestStatistic, ForestStatisticInfo> = {
  hazard_ratio:         { key: 'hazard_ratio',         label: 'Hazard Ratio',                 scale: 'log',    neutralValue: 1, ciKey: 'hazard_ratio_ci' },
  risk_relative:        { key: 'risk_relative',        label: 'Risco Relativo',               scale: 'log',    neutralValue: 1, ciKey: 'risk_relative_ci' },
  odds_ratio:           { key: 'odds_ratio',           label: 'Razão de Chances',             scale: 'log',    neutralValue: 1, ciKey: 'odds_ratio_ci' },
  risk_difference:      { key: 'risk_difference',      label: 'Diferença Absoluta de Risco',  scale: 'linear', neutralValue: 0, ciKey: 'risk_difference_ci' },
  calc_risk_difference: { key: 'calc_risk_difference', label: 'Diferença Absoluta de Risco',  scale: 'linear', neutralValue: 0, ciKey: '' },
};

export function pickForestStatistic(outcomes: any[]): ForestStatistic {
  const ordered: Exclude<ForestStatistic, 'calc_risk_difference'>[] = [
    'hazard_ratio',
    'risk_relative',
    'odds_ratio',
    'risk_difference',
  ];
  for (const k of ordered) {
    const inOutcomes = outcomes.some((o) => o.statistics_reported?.[k] !== undefined);
    const inSubgroups = outcomes.some((o) =>
      o.subgroups?.some((sg: any) => sg[k] !== undefined),
    );
    if (inOutcomes || inSubgroups) return k;
  }
  if (outcomes.some((o) => o.table_2x2)) return 'calc_risk_difference';
  return 'risk_difference';
}

/**
 * Diferença absoluta de risco (pp) e IC 95% pela aproximação de Wald.
 * Usada como fallback do forest plot quando o YAML traz só a 2×2.
 */
export function calcRiskDifferenceCI(table: Table2x2): { rd: number; ci: [number, number] } {
  const eI = table.intervention.events;
  const nI = eI + table.intervention.no_event;
  const eC = table.comparator.events;
  const nC = eC + table.comparator.no_event;
  const pI = eI / nI;
  const pC = eC / nC;
  const rd = (pI - pC) * 100;
  const se = Math.sqrt((pI * (1 - pI)) / nI + (pC * (1 - pC)) / nC) * 100;
  return { rd, ci: [rd - 1.96 * se, rd + 1.96 * se] };
}
