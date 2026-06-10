---
type: source
status: stable
created: 2026-05-16
updated: 2026-05-16
---

# Fuente — canvas/ (mockups React)

**Ruta**: `frontend/design_handoff_my_finances/canvas/` (13 archivos `.jsx` + `index.html`).
Parte del bundle [[source-design-handoff-cuaderno]].

Los **mockups ejecutables** de todas las pantallas. Cada `.jsx` exporta una o más funciones que se renderizan como artboards en un canvas tipo Figma. **No es código para producción** — es referencia visual.

## Cómo verlo

Abrir `canvas/index.html` en un browser local. Renderiza todos los artboards lado a lado con datos de ejemplo (de `shared.jsx`, en pesos argentinos).

## Archivos de **infraestructura** del handoff (ignorar para implementar)

- `index.html` — entry point del canvas.
- `design-canvas.jsx` (966 líneas) — canvas custom tipo Figma (artboards drag-drop, reorderables, fullscreen, persistencia en `.design-canvas.state.json`).
- `ios-frame.jsx` (338 líneas) — chrome falso de iOS 26 (status bar, signal, battery, home indicator) para envolver mockups mobile.
- `mount.jsx` (179 líneas) — script que ensambla todos los artboards en el canvas.

## Archivos de **contenido** (referencias para implementar)

- **`shared.jsx`** (146 líneas) — datos de ejemplo: usuario "Tobías Cerutti", transacciones, categorías, metas, inversiones. Útil para entender el shape de datos esperado por el frontend.
- **`cuaderno-system.jsx`** (173 líneas) — `CuadernoSidebar`, `PageShell`, primitivas comunes. Referencia para el Paso 3 (AppLayout).
- **`direction-a.jsx`** (676 líneas) — Dashboard (`ADaily`), Transacciones (`ATransactions`), Inversiones (`AInvest`).
- **`screens-reports-goals.jsx`** (387 líneas) — Reportes (`ReportsScreen`), Metas lista + detalle (`GoalsScreen`, `GoalDetailScreen`).
- **`screens-categories-profile.jsx`** (276 líneas) — Categorías (`CategoriesScreen`), Profile (`ProfileScreen`).
- **`screens-auth.jsx`** (302 líneas) — Login (`LoginScreen`), Register (`RegisterScreen`).
- **`screens-mobile.jsx`** (933 líneas) — 7 pantallas mobile iOS: Dashboard, Quick add, Transacciones, Inversiones, Metas + detalle, Goal detail, Login.
- **`screens-onboarding.jsx`** (822 líneas) — Onboarding desktop (5 pasos) + mobile (3 pasos).
- **`screens-overlays.jsx`** (1080 líneas) — Modales (nueva gasto, nueva inversión, editar meta, editar categoría, eliminar), bottom sheets mobile, toasts.

## Mapeo mockup → archivo del repo (del [[source-handoff-readme]] § 6 paso 4)

| Página real | Archivo del frontend | Función a referenciar en canvas/ |
|---|---|---|
| Dashboard | `features/dashboard/DashboardPage.tsx` | `direction-a.jsx · ADaily()` |
| Transacciones | `features/transactions/TransactionsPage.tsx` | `direction-a.jsx · ATransactions()` |
| Reportes | `features/reports/ReportsPage.tsx` | `screens-reports-goals.jsx · ReportsScreen()` |
| Categorías | `features/categories/CategoriesPage.tsx` | `screens-categories-profile.jsx · CategoriesScreen()` |
| Metas | `features/goals/...` | `screens-reports-goals.jsx · GoalsScreen() + GoalDetailScreen()` |
| Profile | `features/auth/ProfilePage.tsx` | `screens-categories-profile.jsx · ProfileScreen()` |
| Login + Register | `features/auth/...` | `screens-auth.jsx · LoginScreen() + RegisterScreen()` |
| Inversiones | (paleta Tinta) | `direction-a.jsx · AInvest()` |

## Detalles de implementación visibles solo en el canvas

- **Sparklines de inversiones**: `<svg>` inline (80×22), NO Recharts. Ver `direction-a.jsx · NightSparkline()`.
- **Iconografía**: glifos Unicode editoriales (`❧ ✦ ◐ ◯ ◇`) en lugar de Lucide cuando se puede.
- **Stat row**: 3-4 celdas con divisores verticales (border-right sepia) para KPIs alineados.
- **Day group**: transacciones agrupadas por día con header serif (hoy, ayer, fecha; vs. JetBrains Mono para fechas viejas).
