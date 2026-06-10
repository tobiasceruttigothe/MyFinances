---
type: source
status: stable
created: 2026-05-16
updated: 2026-05-16
---

# Fuente — Design handoff "Cuaderno"

**Tipo**: bundle de diseño (referencia para implementación del frontend).
**Ruta**: `frontend/design_handoff_my_finances/`
**Fecha**: mayo 2026.
**Autoría**: diseñado en Anthropic Skills (Claude Sonnet 4.5).
**Estado en git**: untracked en commit `291c1db` (apareció después del HEAD).

Página de entrada al tema. Sub-resúmenes en [[source-handoff-readme]], [[source-design-system-html]], [[source-handoff-canvas]].

## Qué es

Un **handoff hi-fi** (alta fidelidad) que introduce un sistema visual nuevo llamado **"Cuaderno"** para reemplazar la capa visual del frontend existente. Mockups con colores finales, tipografía final, espaciado final y todos los estados visualizados — listo para implementación pixel-perfect.

Cita literal del README:
> "Los archivos `.html` y `.jsx` que están acá son **referencias de diseño construidas como prototipos HTML/React standalone**. NO son código para copiar y pegar a producción. Tu tarea es **recrear estos diseños dentro del frontend existente del repo**."

## Estructura del bundle

```
design_handoff_my_finances/
├── README.md                          (257 líneas)
├── design-system.html                 (1465 líneas) — ★ manual oficial
└── canvas/                            (mockups React standalone)
    ├── index.html, mount.jsx, design-canvas.jsx, ios-frame.jsx   (infraestructura)
    ├── cuaderno-system.jsx            (Sidebar + Page shell)
    ├── shared.jsx                     (datos de ejemplo, pesos argentinos)
    ├── direction-a.jsx                (Dashboard, Inversiones, Transacciones)
    ├── screens-reports-goals.jsx
    ├── screens-categories-profile.jsx
    ├── screens-auth.jsx
    ├── screens-mobile.jsx             (7 pantallas iOS)
    ├── screens-onboarding.jsx         (5 pasos desktop + 3 mobile)
    └── screens-overlays.jsx           (modales + bottom sheets + toasts)
```

## Tesis

La app es un **cuaderno personal de cuentas**, no un dashboard tipo banca tradicional. Identidad editorial con fuentes serif/sans/mono mixtas, paleta "Papel" cálida default, sin azul corporativo. Ver [[concept-sistema-cuaderno]] para los pilares concretos.

## Plan de migración (7 pasos)

Detallado en [[source-handoff-readme]] § 6.

1. **Tokens CSS + fuentes** (≈30 min) — reemplazar `frontend/src/index.css`, agregar `<link>` Google Fonts.
2. **Componentes base** (≈2-3 hrs) — reescribir `button`, `input`, `card`, `badge`, `toast`, `skeleton`.
3. **Layout global** — reescribir `AppLayout` con sidebar 224px, serif italic + glifo `❧` en activo.
4. **Páginas, una por una** — dashboard, transacciones, reportes, categorías, metas, profile, auth.
5. **Inversiones · paleta Tinta** — usar wrapper `data-mode="tinta"` para redefinir CSS variables ([[concept-cuaderno-vs-tinta-mode]]).
6. **Overlays y mobile** — Radix Dialog/Toast con chrome paper; bottom sheets para mobile.
7. **Recharts** — reemplazar paleta default por `var(--color-sepia)`, `var(--color-sage)`, etc.

## Decisiones de diseño importantes a respetar (cita literal § 7)

> - El borde inferior de los inputs en lugar de caja completa. Línea de cuaderno.
> - Los números importantes en serif (`Newsreader`), no en sans. Balance, ROI, montos hero.
> - Los ROI y porcentajes en serif italic cuando son evaluativos ("+ 25.8%").
> - Las fechas y montos crudos en mono (`JetBrains Mono`). Da sensación de "ledger".
> - El item activo del sidebar tiene un `❧` (fleurón) y va en italic. No subrayado, no badge azul.
> - Estado vacío con frase en serif italic ("La página de hoy está en blanco."), no ícono triste.
> - Toasts como tiras de papel con borde-left de 4px, no rectángulos pastel.
> - Confirmaciones destructivas piden tipear `ELIMINAR` para acciones grandes. Fricción proporcional al daño.
> - Categorías con glifos editoriales (❧ ✦ ◐ ◯ ◇) en lugar de emoji cuando sea posible.
> - El cuadro del balance principal NO es un gradient azul — es la paper card con el número en serif gigante.

Resumido en [[concept-sistema-cuaderno]].

## Mocks que el handoff explícitamente NO implementó (cita § 8)

> "Estos casos quedaron sin pantalla diseñada — implementalos siguiendo el sistema documentado, no inventes lenguaje nuevo":
> - Estados vacíos por sección
> - Loading skeletons
> - Estados de error de red
> - Notificaciones in-app
> - Tab "Aportes" del modal de meta (sólo se diseñó la tab "Plan")
> - Modal de detalle de transacción
> - Búsqueda global / command palette (⌘K)

## Páginas del wiki derivadas

- [[entities/frontend]]
- [[concepts/sistema-cuaderno]], [[concepts/cuaderno-vs-tinta-mode]], [[concepts/frontend-stack]]
- [[decisions/identidad-cuaderno]]
- [[source-handoff-readme]], [[source-design-system-html]], [[source-handoff-canvas]]
- [[overview]] (sección "Frontend")

## Estado de implementación

| Paso | Estado | Notas |
|---|---|---|
| 1 — tokens + fuentes | ✅ aplicado 2026-05-16 | ver [[log]] |
| 2 — componentes base | pendiente | |
| 3 — AppLayout | pendiente | |
| 4 — páginas una por una | pendiente | |
| 5 — Tinta mode (Inversiones) | pendiente | |
| 6 — overlays y mobile | pendiente | |
| 7 — colores de Recharts | pendiente | |
