// Cuaderno palette for Recharts. Recharts pasa los colores como atributos
// SVG (<rect fill="..."/>), no como CSS properties — por eso van como hex
// literales, no `var(--color-sepia)`. Los valores espejan los tokens
// definidos en src/index.css `@theme`. Si esos tokens cambian, sincronizar
// acá manualmente.

export const CHART_INK    = '#1a1612'
export const CHART_SEPIA  = '#7c5a2a'
export const CHART_SAGE   = '#5e7a4f'
export const CHART_WINE   = '#9a3a2e'
export const CHART_GOLD   = '#d4a657'
export const CHART_RULE   = '#c9bca0'

export const CHART_INK_60   = 'rgba(26, 22, 18, 0.6)'
export const CHART_SEPIA_60 = 'rgba(124, 90, 42, 0.6)'
export const CHART_SAGE_70  = 'rgba(94, 122, 79, 0.7)'

// Paleta canónica per roadmap § Paso 7. Usar para series múltiples
// (pies, allocations, breakdowns). Orden: sepia → sage → wine → gold,
// luego semitransparencias para evitar repetir tonos puros.
export const CHART_COLORS = [
  CHART_SEPIA,
  CHART_SAGE,
  CHART_WINE,
  CHART_GOLD,
  CHART_INK_60,
  CHART_SEPIA_60,
  CHART_SAGE_70,
]

// Estilos comunes para ejes y tooltips de Recharts. Cada Page los puede
// spreadear en sus props de XAxis/YAxis/Tooltip.

export const CHART_TICK_STYLE = {
  fontSize: 11,
  fontFamily: 'JetBrains Mono',
  fill: CHART_SEPIA,
} as const

export const CHART_GRID_PROPS = {
  strokeDasharray: '2 4',
  stroke: 'rgba(124, 90, 42, 0.18)',
  vertical: false,
} as const

export const CHART_TOOLTIP_STYLE = {
  borderRadius: '6px',
  border: `1px solid ${CHART_RULE}`,
  fontSize: '12px',
  fontFamily: 'Newsreader, serif',
  background: '#f4ecdd',
} as const
