---
type: concept
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-design-handoff-cuaderno]], [[source-design-system-html]]
---

# Cuaderno vs. Tinta — dos paletas, un componente

Mecanismo por el cual los **mismos componentes** (Card, Button, Input, etc.) se ven distintos en Inversiones que en el resto de la app, sin código de tema duplicado.

## El truco

Wrappear la sección de Inversiones con un atributo de scope:

```html
<div data-mode="tinta">
  <!-- toda la página de inversiones acá -->
</div>
```

Dentro de `frontend/src/index.css`, redefinir las variables del scope tinta:

```css
[data-mode="tinta"] {
  --color-paper:   var(--color-tinta-bg);
  --color-paper-2: var(--color-tinta-bg-2);
  --color-ink:     var(--color-tinta-ink);
  --color-rule:    var(--color-tinta-rule);
  --color-sepia:   var(--color-tinta-sepia);
  --color-sage:    var(--color-tinta-sage);
  --color-wine:    var(--color-tinta-wine);
  --color-gold:    var(--color-tinta-gold);
}
```

Los componentes (`Card`, `Button`, `Input`) usan **siempre** las variables genéricas (`var(--color-paper)`, `var(--color-ink)`, etc.) y "se adaptan" automáticamente al cambiar de scope.

## Por qué

> "Inversiones es **el cuaderno encuadernado en azul oscuro** — la sección de números fríos." ([[source-handoff-readme]])

Es identidad, no funcionalidad. **No es un dark mode global** — el resto de la app sigue en paleta Papel cálida. El usuario nunca elige; el switch es por sección.

## Paleta Tinta (valores)

```
--color-tinta-bg:    #1f2a38   (fondo)
--color-tinta-bg-2:  #27374a   (fondo elevado)
--color-tinta-rule:  #36465a   (bordes)
--color-tinta-ink:   #ecdfbd   (texto)
--color-tinta-sepia: #c7a974
--color-tinta-sage:  #9ec79c
--color-tinta-wine:  #d27e7e
--color-tinta-gold:  #d4a85a
```

Los acentos (sepia / sage / wine / gold) en versión clara para mantener contraste sobre fondo oscuro.

## Implicancia para implementación

**Regla**: todo componente nuevo debe consumir CSS variables genéricas (`var(--color-paper)`, etc.), **nunca** colores hardcodeados ni utilities Tailwind con valores fijos (`bg-amber-50`). De lo contrario, no soporta el modo Tinta automáticamente.

Cuando este Paso 5 se implemente, el wrapper `data-mode="tinta"` solo necesita aplicarse al root del módulo de Inversiones (probablemente en `features/investments/InvestmentsPage.tsx`). Todo el subtree hereda el switch.

## Referencias

- Implementación en mockup: `canvas/direction-a.jsx · AInvest()` y `INVEST_PALETTES.tinta`.
- Sparklines de inversiones: NO usar Recharts, sino SVG inline. Ver `NightSparkline()` en el mismo archivo.

## Estado

Pendiente de aplicar — es el Paso 5 del plan de migración. Ver [[source-design-handoff-cuaderno]] "Estado de implementación".
