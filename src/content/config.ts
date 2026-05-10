// src/content/config.ts
//
// Schema de Content Collections para os Reports de Evidências.
// Cada report é um arquivo YAML em src/content/reports/[slug].yaml.
// A validação é automática: erros de digitação, campos faltando ou tipos
// errados quebram o build com mensagem clara.

import { defineCollection, z } from 'astro:content';

// --------------------------------------------------------------
// Sub-schemas reutilizáveis
// --------------------------------------------------------------

const tabelaArmSchema = z.object({
  label: z.string(),                  // "Cetamina", "Rivaroxabana", etc.
  events: z.number().int().nonnegative(),
  no_event: z.number().int().nonnegative(),
});

const tabela2x2Schema = z.object({
  intervention: tabelaArmSchema,
  comparator: tabelaArmSchema,
  event_label: z.string(),            // "Morte", "Colapso", "Evento"
  no_event_label: z.string().default('Sem evento'),
});

const intervalSchema = z.tuple([z.number(), z.number()]);

const statisticsSchema = z.object({
  // Use o que o artigo reportar. Tudo é opcional — só preencha o que existir.
  risk_relative: z.number().optional(),
  risk_relative_ci: intervalSchema.optional(),

  odds_ratio: z.number().optional(),
  odds_ratio_ci: intervalSchema.optional(),

  hazard_ratio: z.number().optional(),
  hazard_ratio_ci: intervalSchema.optional(),

  risk_difference: z.number().optional(),       // em pontos percentuais
  risk_difference_ci: intervalSchema.optional(),

  relative_risk_change: z.number().optional(),  // em %, positivo ou negativo
  p_value: z.union([z.number(), z.string()]).optional(),
});

const subgroupSchema = z.object({
  name: z.string(),
  note: z.string().optional(),       // ex.: "escore de gravidade"
  n: z.number().int().optional(),
  risk_difference: z.number().optional(),
  risk_difference_ci: intervalSchema.optional(),
  hazard_ratio: z.number().optional(),
  hazard_ratio_ci: intervalSchema.optional(),
  events_intervention: z.number().int().optional(),
  events_comparator: z.number().int().optional(),
});

const outcomeSchema = z.object({
  id: z.string(),                                          // slug curto, ex.: "mortalidade"
  label: z.string(),                                       // "Desfecho primário · Morte hospitalar em 28 dias"
  direction: z.enum(['favoravel', 'desfavoravel', 'neutro']),
  table_2x2: tabela2x2Schema.optional(),
  statistics_reported: statisticsSchema.optional(),
  subgroups: z.array(subgroupSchema).optional(),
  subgroups_title: z.string().optional(),                  // título da seção de subgrupos
  note: z.string().optional(),                             // observação curta abaixo das métricas
});

// --------------------------------------------------------------
// Schema principal
// --------------------------------------------------------------

const reportSchema = z.object({
  // Identificação
  report_id: z.number().int().positive(),
  study_acronym: z.string(),                               // "RSI", "INVICTUS"
  study_type: z.enum([
    'ensaio_clinico_randomizado',
    'revisao_sistematica',
    'metanalise',
    'estudo_observacional',
  ]),
  specialty: z.string(),                                   // livre, ex.: "Emergência e Terapia Intensiva"

  title: z.string(),                                       // título completo do report

  citation: z.object({
    authors: z.string(),
    journal: z.string(),
    year: z.number().int(),
    volume: z.union([z.string(), z.number()]).optional(),
    pages: z.string().optional(),
    doi: z.string().optional(),
    url: z.string().url(),
  }),

  // Randomização
  randomization: z.object({
    total: z.number().int().positive(),
    ratio: z.string().default('1:1'),
    arm_intervention: z.number().int().positive(),
    arm_comparator: z.number().int().positive(),
    follow_up: z.string().optional(),                      // ex.: "Seguimento médio 3,1 anos"
  }),

  // PICO
  pico: z.object({
    population: z.object({
      main: z.string(),
      detail: z.string().optional(),
    }),
    intervention: z.object({
      main: z.string(),
      detail: z.string().optional(),
    }),
    comparator: z.object({
      main: z.string(),
      detail: z.string().optional(),
    }),
    outcomes: z.object({
      primary: z.string(),
      secondary: z.string().optional(),
    }),
  }),

  // Desfechos analisados (1 ou mais)
  outcomes: z.array(outcomeSchema).min(1),

  // Mensagem clínica (1 parágrafo, suporta **negrito** simples via marcação)
  clinical_message: z.string(),

  // Bottom line para a aba Infográfico (lista de 3-5 itens)
  bottom_line: z.array(z.string()).min(2).max(6),

  // Metadados de rodapé
  study_meta: z.array(z.string()),
});

// --------------------------------------------------------------
// Export
// --------------------------------------------------------------

const reports = defineCollection({
  type: 'data',                                            // YAML/JSON (não Markdown)
  schema: reportSchema,
});

export const collections = { reports };
