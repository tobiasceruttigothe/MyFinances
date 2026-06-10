---
type: source
status: stable
created: 2026-05-16
updated: 2026-05-16
---

# Fuente — README.md del handoff Cuaderno

**Ruta**: `frontend/design_handoff_my_finances/README.md` (257 líneas).
Parte del bundle [[source-design-handoff-cuaderno]].

Es el documento de orientación. Indica cómo usar el handoff, qué fidelidad tiene, cuál es el plan de migración, y qué decisiones son irrenunciables.

## Estructura (10 secciones)

1. Sobre los archivos del bundle (prototipos, no código de producción).
2. Fidelidad (hi-fi, pixel-perfect).
3. Estructura del bundle (árbol de archivos).
4. Identidad visual · resumen ejecutivo (sistema "Cuaderno", paletas, tipografía).
5. **Estado del repo actual** (stack al commit `291c1db`).
6. **Plan de migración recomendado** (7 pasos detallados).
7. **Decisiones de diseño importantes a respetar** (los "8 mandamientos").
8. Mocks que NO se implementaron (pendientes a inventar siguiendo el sistema).
9. Datos de ejemplo (vienen de `shared.jsx`, pesos argentinos).
10. Cómo arrancar (instrucción para Claude Code).

## § 5 — Stack del repo confirmado por el README

> React 19 + TypeScript + Vite 7, Tailwind CSS v4 (con `@tailwindcss/vite`), shadcn/ui con paleta default (azul `#3b82f6` como `--primary`), Radix UI primitives, React Hook Form + Zod, TanStack Query, Recharts, React Router DOM 7, Zustand, Lucide React icons.

Coincide con `frontend/package.json` ([[concept-frontend-stack]]). Lo que cambia: **toda la capa visual**. La lógica (hooks de React Query, mutations, validaciones) se mantiene casi intacta — sólo cambia el JSX renderizado y los tokens CSS.

## § 6 — Plan de migración (resumen ejecutivo)

| Paso | Esfuerzo | Qué tocar | Referencia en canvas/ |
|---|---|---|---|
| 1 — Tokens + fuentes | ≈30 min | `frontend/src/index.css` (reemplazo completo), `frontend/index.html` (link Google Fonts) | — |
| 2 — Componentes base | ≈2-3 hrs | `frontend/src/components/ui/{button,input,card,badge,toast,skeleton}.tsx` | código TS en `design-system.html` |
| 3 — AppLayout | ≈30 min | `frontend/src/components/shared/AppLayout.tsx` | `cuaderno-system.jsx · CuadernoSidebar`, `direction-a.jsx · ADaily` |
| 4 — Páginas | ≈30-60 min c/u | `features/dashboard/`, `features/transactions/`, `features/reports/`, `features/categories/`, `features/goals/`, `features/auth/` | una función exportada por mockup file |
| 5 — Inversiones (Tinta) | ≈45 min | wrapper `data-mode="tinta"` + redefinición de CSS vars | `direction-a.jsx · AInvest` |
| 6 — Overlays y mobile | — | Radix Dialog / Toast, bottom sheets | `screens-overlays.jsx`, `screens-mobile.jsx` |
| 7 — Recharts colors | — | array de colores de gráficos | usa `var(--color-sepia)` etc. |

Tabla archivo-por-archivo más detallada en [[source-design-system-html]].

## § 7 — Decisiones a respetar (cita completa)

> Estas son las decisiones que dan personalidad al sistema. Si las perdés, se convierte en un dashboard genérico más.
>
> - El borde inferior de los inputs en lugar de caja completa. Línea de cuaderno.
> - Los números importantes en serif (Newsreader), no en sans. Balance, ROI, montos hero.
> - Los ROI y porcentajes en serif italic cuando son evaluativos ("+ 25.8%").
> - Las fechas y montos crudos en mono (JetBrains Mono). Da sensación de "ledger".
> - El item activo del sidebar tiene un ❧ (fleurón) y va en italic. No subrayado, no badge azul.
> - Estado vacío con frase en serif italic ("La página de hoy está en blanco."), no ícono triste.
> - Toasts como tiras de papel con borde-left de 4px, no rectángulos pastel.
> - Confirmaciones destructivas piden tipear ELIMINAR para acciones grandes (borrar meta con historial). Fricción proporcional al daño.
> - Categorías con glifos editoriales (❧ ✦ ◐ ◯ ◇) en lugar de emoji cuando sea posible. Mantiene el tono.
> - El cuadro del balance principal NO es un gradient azul — es la paper card con el número en serif gigante.

## Recomendación de orden (§ 10)

> 1. Leé `design-system.html` completo. Es el manual.
> 2. Mirá los `.jsx` del canvas para entender pantallas ensambladas.
> 3. Hacé el Paso 1 (tokens) y verificá que la app sigue compilando.
> 4. Hacé el Paso 2 (componentes base) en una sola sentada.
> 5. Migrá páginas una por una. Hacé un commit por página.
> 6. Inversiones para el final, con el truco de las CSS variables.
