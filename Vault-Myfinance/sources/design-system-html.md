---
type: source
status: stable
created: 2026-05-16
updated: 2026-05-16
---

# Fuente — design-system.html (manual oficial)

**Ruta**: `frontend/design_handoff_my_finances/design-system.html` (1465 líneas).
Parte del bundle [[source-design-handoff-cuaderno]].

El **manual oficial** del sistema visual. Página HTML autocontenida con sidebar de navegación y código TypeScript copiable inline. La fuente de verdad de los tokens y componentes.

> **No copiar el HTML al wiki**. Es referencia activa: abrirlo en un browser y leer/copiar de ahí.

## Cómo verlo

Abrir `design-system.html` directamente en un browser (no requiere build). Linkea a Google Fonts (Newsreader, Hanken Grotesk, JetBrains Mono).

## Secciones (navegación de la sidebar)

- **Fundación**: paletas, tipografía, escala de espaciado, radios, sombras, glifos.
- **Componentes**: Button, Input, Card, Badge, Progress, Stat row, Day group, Hero card, Sparkline. Cada uno con preview visual + bloque de código TypeScript copiable.
- **Patrones**: Page head, Sección titulada, Estado vacío.
- **Implementación**: bloque "Tokens CSS" y tabla "Migración del repo actual".

## Datos clave (resumen)

### Paleta Papel (default — ver [[concept-sistema-cuaderno]])
- `--color-paper: #f4ecdd` · fondo
- `--color-paper-2: #ede2cd` · fondo elevado
- `--color-ink: #1a1612` · texto principal
- `--color-rule: #c9bca0` · bordes
- `--color-sepia: #7c5a2a` · acento secundario
- `--color-sage: #5e7a4f` · éxito
- `--color-wine: #9a3a2e` · error / destructivo
- `--color-gold: #d4a657` · acento de oro

### Paleta Tinta (Inversiones — ver [[concept-cuaderno-vs-tinta-mode]])
- `--color-tinta-bg: #1f2a38`
- `--color-tinta-bg-2: #27374a`
- `--color-tinta-rule: #36465a`
- `--color-tinta-ink: #ecdfbd`
- + variantes claras de sepia/sage/wine/gold

### Tipografía
- `--font-serif: 'Newsreader', Georgia, serif` — títulos, números importantes, citas
- `--font-sans: 'Hanken Grotesk', system-ui, sans-serif` — UI, body, botones
- `--font-mono: 'JetBrains Mono', ui-monospace, monospace` — fechas, montos crudos, tickers

### Radios
- `--radius-xs: 4px`, `--radius-sm: 6px`, `--radius-md: 8px`, `--radius-lg: 12px`

## Bloque Tokens CSS

El bloque que se copia entero como reemplazo de `frontend/src/index.css` está en la sección `#tokens-css` (líneas 1269–1326 del HTML). Sintaxis Tailwind v4 `@theme {}`. Incluye:

- `@import "tailwindcss";`
- `@theme { ... }` con las dos paletas + fuentes + radios.
- `@layer base { body { ... } }` con `var(--color-paper)`, font-family, y un par de radial-gradients suaves de fondo.

> **No incluye** tokens de espaciado custom (Tailwind ya los provee) ni sombras nominales en el bloque base — los componentes los definen donde los necesitan.

## Migración archivo-por-archivo

La tabla (sección `#migration`, líneas ~1351+) mapea cada archivo del frontend actual a la acción a tomar. Ejemplo:

| Archivo actual | Acción | Notas |
|---|---|---|
| `src/index.css` | reemplazar completo | Borrar HSL shadcn; pegar el bloque `@theme`. `.dark` no se usa. |
| `components/ui/button.tsx` | reescribir con variants | Variantes: `ink · outline · ghost · danger`. |
| `components/ui/card.tsx` | (...) | (...) |
| ... | | |

## Cita del `<link>` a Google Fonts (sección Tokens CSS)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

(El propio `design-system.html` en su `<head>` carga rangos más amplios — 300..700 + opsz — para previsualización de variantes. La cita de arriba es la **versión "production"** que el handoff recomienda copiar al frontend.)
