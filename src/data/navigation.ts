export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface SectionNav {
  id: string;
  label: string;
  href: string;
  items: NavItem[];
}

export const primaryNav: NavItem[] = [
  { label: 'Início', href: '/' },
  {
    label: '5As',
    href: '/cinco-as/',
    children: [
      { label: 'Visão geral', href: '/cinco-as/' },
      { label: 'Perguntar (Ask)', href: '/cinco-as/perguntar/' },
      { label: 'Buscar (Acquire)', href: '/cinco-as/buscar/' },
      { label: 'Avaliar (Appraise)', href: '/cinco-as/avaliar/' },
      { label: 'Aplicar (Apply)', href: '/cinco-as/aplicar/' },
      { label: 'Monitorar (Assess)', href: '/cinco-as/monitorar/' },
    ],
  },
  {
    label: 'Conceitos',
    href: '/conceitos/',
    children: [
      { label: 'Índice', href: '/conceitos/' },
      { label: 'Dúvidas clínicas', href: '/conceitos/duvidas-clinicas/' },
      { label: 'Raciocínio clínico', href: '/conceitos/raciocinio-clinico/' },
      { label: 'SMART', href: '/conceitos/smart/' },
      { label: 'PICO', href: '/conceitos/pico/' },
      { label: 'Pirâmide de evidências', href: '/conceitos/piramide-evidencias/' },
      { label: 'Desenhos de estudo', href: '/conceitos/desenhos-de-estudo/' },
      { label: 'Diretrizes e forças-tarefa', href: '/conceitos/diretrizes-e-forcas-tarefa/' },
      { label: 'Rastreamento', href: '/conceitos/rastreamento/' },
      { label: 'Testes diagnósticos', href: '/conceitos/testes-diagnosticos/' },
      { label: 'História e fundamentos', href: '/conceitos/historia-e-fundamentos/' },
      { label: 'Como buscar', href: '/conceitos/como-buscar/' },
      { label: 'Acesso a fontes', href: '/conceitos/acesso-a-fontes/' },
      { label: 'Medidas de frequência', href: '/conceitos/medidas-de-frequencia/' },
      { label: 'Medidas de efeito', href: '/conceitos/medidas-de-efeito/' },
      { label: 'Vieses', href: '/conceitos/vieses/' },
      { label: 'Decisão compartilhada', href: '/conceitos/decisao-compartilhada/' },
    ],
  },
  {
    label: 'Ferramentas',
    href: '/ferramentas/',
    children: [
      { label: 'Índice', href: '/ferramentas/' },
      { label: 'CASP', href: '/ferramentas/casp/' },
      { label: 'GRADE', href: '/ferramentas/grade/' },
      { label: 'RoB 2.0', href: '/ferramentas/rob/' },
      { label: 'AMSTAR-2', href: '/ferramentas/amstar/' },
    ],
  },
  {
    label: 'Calculadoras',
    href: '/calculadoras/',
    children: [
      { label: 'Índice', href: '/calculadoras/' },
      { label: 'Testes diagnósticos', href: '/calculadoras/testes-diagnosticos/' },
      { label: 'Medidas de efeito', href: '/calculadoras/medidas-de-efeito/' },
    ],
  },
  {
    label: 'Em prática',
    href: '/em-pratica/',
    children: [
      { label: 'Índice', href: '/em-pratica/' },
      { label: 'Diagnóstica', href: '/em-pratica/diagnostica/' },
      { label: 'Terapêutica', href: '/em-pratica/terapeutica/' },
      { label: 'Preventiva', href: '/em-pratica/preventiva/' },
      { label: 'Prognóstica', href: '/em-pratica/prognostica/' },
    ],
  },
  { label: 'Glossário', href: '/glossario/' },
  { label: 'Sobre', href: '/sobre/' },
];

/**
 * Map a section id ('cinco-as', 'conceitos', etc.) to its sidebar items.
 */
export function getSectionNav(sectionId: string): NavItem[] | null {
  const section = primaryNav.find(
    (item) => item.children && item.href.startsWith(`/${sectionId}`)
  );
  return section?.children ?? null;
}

/**
 * Resolve a href against the configured `import.meta.env.BASE_URL`
 * so that links work both at root (dev) and at /evidencias-clinicas/ (GH Pages).
 */
export function withBase(href: string, base: string): string {
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedHref = href.startsWith('/') ? href : `/${href}`;
  return `${normalizedBase}${normalizedHref}` || '/';
}

/**
 * Strip the base prefix from a pathname for comparison with hrefs in nav data.
 * Returns a pathname starting with '/'.
 */
export function stripBase(pathname: string, base: string): string {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  if (normalizedBase && pathname.startsWith(normalizedBase)) {
    const rest = pathname.slice(normalizedBase.length);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}
