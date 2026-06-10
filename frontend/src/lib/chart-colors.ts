// Paleta Fini para Recharts. Recharts pasa los colores como atributos
// SVG (<rect fill="..."/>), no como CSS properties — por eso van como hex
// literales, no `var(--color-sepia)`. Los valores espejan los tokens
// definidos en src/index.css `@theme`. Si esos tokens cambian, sincronizar
// acá manualmente.

export const CHART_INK    = '#46323c'
export const CHART_SEPIA  = '#a3656f'
export const CHART_SAGE   = '#3d9960'
export const CHART_WINE   = '#c94257'
export const CHART_GOLD   = '#e89b2d'
export const CHART_RULE   = '#ecd5b8'
export const CHART_PIG    = '#e0739c'

export const CHART_INK_60   = 'rgba(70, 50, 60, 0.6)'
export const CHART_SEPIA_60 = 'rgba(163, 101, 111, 0.6)'
export const CHART_SAGE_70  = 'rgba(61, 153, 96, 0.7)'

// Paleta canónica para series múltiples (pies, allocations, breakdowns).
// Arranca con el rosa de marca y alterna tonos cálidos/fríos para que
// las categorías vecinas no se confundan.
export const CHART_COLORS = [
  CHART_PIG,
  CHART_SAGE,
  CHART_GOLD,
  CHART_WINE,
  CHART_SEPIA,
  CHART_INK_60,
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
  stroke: 'rgba(163, 101, 111, 0.18)',
  vertical: false,
} as const

export const CHART_TOOLTIP_STYLE = {
  borderRadius: '12px',
  border: `2px solid ${CHART_RULE}`,
  fontSize: '12px',
  fontFamily: 'Nunito, sans-serif',
  background: '#fff6ea',
} as const
