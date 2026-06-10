---
type: analysis
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-design-handoff-cuaderno]], [[source-handoff-readme]], [[source-design-system-html]], [[source-handoff-canvas]]
---

# Roadmap — Migración Cuaderno (Pasos 2-7)

**Para la próxima sesión.** Checklist accionable para continuar la migración del frontend al sistema visual [[concept-sistema-cuaderno]]. El Paso 1 quedó aplicado y verificado al 2026-05-16; los Pasos 2-7 siguen pendientes.

## Pre-flight de cada sesión

```bash
# Activar Node 22 (instalado vía nvm v0.40.3 en la sesión del 2026-05-16)
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh" && nvm use 22

cd /home/tobias/Escritorio/tobias/MyFinances/frontend
npm run dev    # http://localhost:5173 — baseline visual antes de tocar nada
```

Tener al lado:
- `frontend/design_handoff_my_finances/design-system.html` abierto en browser (manual + código TS copiable).
- `frontend/design_handoff_my_finances/canvas/index.html` abierto en browser (mockups ensamblados).
- [[concept-sistema-cuaderno]] (los 10 mandamientos).

---

## Estado al 2026-05-16

| Paso | Estado | Notas |
|---|---|---|
| 1 — tokens + fuentes | ✅ aplicado, build verde | `frontend/src/index.css` reemplazado; `<link>` Google Fonts en `frontend/index.html` |
| 2 — componentes base | ✅ aplicado, build verde, lint sin nuevos errores | 6 commits `feat(ui): migrate {component} to Cuaderno system`; tokens extra (`*-soft`, `radius-pill`, `shadow-*`) agregados al `@theme`. Ver entrada del 2026-05-16 en [[log]]. |
| 3 — AppLayout | ✅ aplicado, build verde | `components/shared/AppLayout.tsx` reescrito al sidebar Cuaderno con `❧` en italic. Ver entrada del 2026-05-16 en [[log]]. |
| 4 — páginas una por una | ✅ aplicado (excepto Investments) | Dashboard / Transacciones / Reportes / Categorías / Metas (lista+detalle) / Profile / Auth (Login+Register) migradas, 1 commit por página. InvestmentsPage queda para Paso 5 por usar paleta Tinta. Ver entradas del 2026-05-16 en [[log]]. |
| 5 — Inversiones · Tinta mode | ✅ aplicado, build verde | Bloque `[data-mode="tinta"]` agregado en `index.css`; `InvestmentsPage` envuelta con `<div data-mode="tinta">` y reescrita al ledger tinta con sparklines SVG inline. Ver entrada del 2026-05-16 en [[log]]. |
| 6 — overlays y mobile | ✅ aplicado (parcial) | `Dialog` + `ConfirmDialog` agregados; los 6 `window.confirm` reemplazados (Goals + Categories con `typeToConfirm="ELIMINAR"`, Transactions + Investments simples). Toast visual ya hecho en Paso 2. **Pendiente**: bottom-sheets mobile + refactor de `toast.tsx` a Radix Toast (a11y); ver entrada 2026-05-16 en [[log]]. |
| 7 — colores Recharts | ✅ aplicado, build verde | Paleta consolidada en `lib/chart-colors.ts`; Reports y GoalDetail importan `CHART_COLORS` + helpers de tick/grid/tooltip. Cero hex Cuaderno hardcoded en `features/`. Ver entrada 2026-05-16 en [[log]]. |

---

## Próximo · ningún paso pendiente del roadmap original

> **Migración Cuaderno cerrada al 2026-05-16** — Pasos 2-7 aplicados. Sub-pendientes que no bloquean nada y quedan como deuda menor:
> - Bottom-sheets mobile (Paso 6 sub-item): convertir formularios inline en Dialogs slide-up para viewport < 640px.
> - ✅ ~~Refactor `toast.tsx` a Radix Toast (a11y; el visual ya es Cuaderno).~~ Cerrado 2026-05-17 — commit `6309b0e refactor(ui): migrate Toast to Radix primitive`. Hook movido a `use-toast.ts` (cierra el react-refresh lint también).
> - ✅ ~~Animaciones del Dialog **y del Toast** (`tailwindcss-animate` o `@keyframes` + `--animate-*` en `@theme` para Tailwind v4).~~ Cerrado 2026-05-17 — commit `81768e8 feat(ui): add open/close animations to Dialog and Toast overlays`. 6 keyframes + 6 tokens `--animate-cuaderno-*` en `@theme`; salidas con `forwards` para evitar snap-back.
> - ✅ ~~Borrar deuda muerta: `components/ui/label.tsx` y alias legacy en `badge.tsx`.~~ Cerrado 2026-05-17 — commit `39ecdd5 chore(ui): remove unused Badge and Label components`. Ambos archivos eliminados (eran dead code completo; cero importadores).
> - Visual review en navegador (`npm run dev`) recorriendo cada pantalla contra `design-system.html`. **Nota adicional**: `OAuthCallbackPage.tsx` quedó fuera del Paso 4 y sigue con look shadcn azul (`bg-gray-50`, `bg-blue-600`, `bg-red-100`); migrarla cuando se haga la pasada visual.
> - Sparkline real en `InvestmentsPage` cuando `investments-service` exponga history.
> - ✅ Tech-debt de lint preexistente — **cerrado a 0 errores** (queda 1 warning RHF no bloqueante):
>   - ✅ 3 errores en `router/index.tsx` cerrados 2026-05-17 (commit `3e60e9e refactor(router): split route guards into separate module`).
>   - ✅ 1 error en `toast.tsx` (export `useToast`) cerrado con el commit del Toast.
>   - ✅ 2 errores `react-hooks/immutability` + 1 (oculto) `react-hooks/set-state-in-effect` en `OAuthCallbackPage.tsx` cerrados 2026-05-17 (commit `02b5fb2 feat(ui): migrate OAuthCallback to Cuaderno + fix lint errors`). Refactor: inline + mover validación al lazy initializer de `useState`.
>   - ✅ 1 warning `react-hooks/incompatible-library` en `TransactionsPage.tsx:79` cerrado 2026-05-17 (commit `54a6e18 refactor(transactions): swap useForm().watch() for useWatch`). **Lint queda a 0 errores + 0 warnings.**

---

## Paso 2 — Componentes base (≈2-3 hrs) · ✅ HECHO

Reescribir los 6 componentes de `frontend/src/components/ui/`. **Todos ya existen** (scaffolding shadcn default) — es reemplazo, no creación.

| Componente | Archivo | Patrón Cuaderno | Cita literal del handoff |
|---|---|---|---|
| Button | `button.tsx` | variantes `ink · outline · ghost · danger` | "Quitar `cva` + `class-variance-authority` y usar el patrón. Variantes: ink · outline · ghost · danger." |
| Input | `input.tsx` | línea inferior, no caja completa | "El borde inferior de los inputs en lugar de caja completa. Línea de cuaderno." |
| Card | `card.tsx` | PaperCard simple (sin Header/Content/Footer separados) | sección Componentes del design-system |
| Badge | `badge.tsx` | variantes `sepia · sage · wine · ink` | sección Componentes del design-system |
| Toast | `toast.tsx` | tira de papel con borde-left 4px, serif italic | "Toasts como tiras de papel con borde-left de 4px, no rectángulos pastel." |
| Skeleton | `skeleton.tsx` | shimmer en `var(--sepia-soft)`, no gris | "cambiar el shimmer gris por `var(--sepia-soft)`" |

### Flujo recomendado por componente

1. Abrir `design-system.html` en browser → ir a sección **Componentes → {nombre}** → copiar el bloque TypeScript de referencia.
2. Adaptar al patrón del frontend (probablemente `forwardRef`, `cn()`, props de Radix donde corresponda).
3. **Usar variables CSS genéricas siempre** (`var(--color-paper)`, `var(--color-ink)`, etc.) — no hardcodear hex ni utilities con colores fijos. Esto garantiza que el [[concept-cuaderno-vs-tinta-mode]] del Paso 5 funcione gratis.
4. Verificar visualmente en dev server con algún uso real (un Page que use el componente).
5. **Un commit por componente**: `feat(ui): migrate {component} to Cuaderno system`.

### Criterio de done — Paso 2

- ✅ Los 6 componentes usan variables CSS, nada hardcodeado.
- ✅ `npm run build` sigue verde.
- ✅ Visualmente la app empieza a tener identidad Cuaderno (cards papel + cream, botones tinta, inputs línea inferior) aunque las páginas aún no estén migradas.
- ⚠️ Lint **no debe agregar nuevos errores**. Los 13 errores + 5 warnings preexistentes (ver [[log]] entrada del Paso 1) son tech-debt aparte.

---

## Paso 3 — AppLayout (≈30 min) · ✅ HECHO

Archivo: `frontend/src/components/shared/AppLayout.tsx`.

- **Sidebar**: 224px, borde sepia a la derecha (`border-r border-rule`).
- **Items**: serif `Newsreader`, no íconos Lucide.
- **Item activo**: fondo `var(--color-ink)`, texto `var(--color-paper)`, italic, con glifo `❧`. **No** subrayado, **no** badge azul.
- **Logo**: "MyFinances" en serif 22px, el `.` en `var(--color-wine)`.
- **Footer del sidebar**: cita en serif italic sepia.

Referencias:
- `canvas/cuaderno-system.jsx · CuadernoSidebar()` (implementación de referencia).
- `canvas/direction-a.jsx · ADaily()` (layout completo de la página principal).

Criterio: navegando entre páginas se ve el sidebar Cuaderno; el item activo refleja la ruta actual; el `❧` aparece en italic.

---

## Paso 4 — Páginas, una por una (≈30-60 min c/u) · ✅ HECHO (excepto Investments)

Orden sugerido (de menos a más complejidad de UI):

| # | Página | Archivo del frontend | Mockup de referencia |
|---|---|---|---|
| 1 | Dashboard | `features/dashboard/DashboardPage.tsx` | `canvas/direction-a.jsx · ADaily()` |
| 2 | Transacciones | `features/transactions/TransactionsPage.tsx` | `canvas/direction-a.jsx · ATransactions()` |
| 3 | Reportes | `features/reports/ReportsPage.tsx` | `canvas/screens-reports-goals.jsx · ReportsScreen()` |
| 4 | Categorías | `features/categories/CategoriesPage.tsx` | `canvas/screens-categories-profile.jsx · CategoriesScreen()` |
| 5 | Metas (lista + detalle) | `features/goals/...` | `canvas/screens-reports-goals.jsx · GoalsScreen() + GoalDetailScreen()` |
| 6 | Profile | `features/auth/ProfilePage.tsx` | `canvas/screens-categories-profile.jsx · ProfileScreen()` |
| 7 | Login + Register | `features/auth/...` | `canvas/screens-auth.jsx · LoginScreen() + RegisterScreen()` |

**Un commit por página**: `feat(ui): migrate {page} to Cuaderno system`.

> **Inversiones queda para el Paso 5** (paleta Tinta) — no migrar acá.

Recordatorios irrenunciables para cada página (ver [[concept-sistema-cuaderno]]):
- Números importantes en serif `Newsreader`.
- ROI/porcentajes evaluativos en serif italic (`+ 25.8%`).
- Fechas y montos crudos en mono `JetBrains Mono`.
- Estado vacío con frase en serif italic, no ícono triste.
- Balance principal NO es gradient azul — paper card con número serif gigante.

---

## Paso 5 — Inversiones · Tinta mode (≈45 min) · ✅ HECHO

Ver [[concept-cuaderno-vs-tinta-mode]] para el mecanismo completo.

1. Agregar en `frontend/src/index.css` un bloque para el scope tinta:
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
2. Wrappear el root de `features/investments/InvestmentsPage.tsx` con `<div data-mode="tinta">`.
3. **Sparklines: NO Recharts**, usar SVG inline. Ver `canvas/direction-a.jsx · NightSparkline()`.

Criterio: la página de Inversiones se ve en azul oscuro, todos los componentes (Card, Button, Input) heredan automáticamente sin tocar su código.

---

## Paso 6 — Overlays y mobile · ✅ HECHO (parcial)

- **Modales**: `Radix Dialog` (ya instalado). Chrome paper: borde sepia, sombra cálida (`--shadow-pop`), fondo papel con radial gradient. Ver `canvas/screens-overlays.jsx`.
- **Bottom sheets mobile**: igual que modales pero con animación slide-up desde abajo + handle. Ver `canvas/screens-mobile.jsx`.
- **Toasts**: `Radix Toast` (ya instalado). Tira de papel con borde-left 4px de color (sage para success, wine para error, sepia para info).
- **Confirmaciones destructivas**: piden tipear `ELIMINAR` para acciones grandes (borrar meta con historial).

---

## Paso 7 — Recharts colors · ✅ HECHO

Reemplazar el array de colores actual `['#3b82f6', '#10b981', ...]` (probablemente en `lib/` o en cada Page que usa Recharts):

```ts
const COLORS = [
  'var(--color-sepia)',
  'var(--color-sage)',
  'var(--color-wine)',
  'var(--color-gold)',
  'rgba(26, 22, 18, 0.6)',   // ink 60%
  'rgba(124, 90, 42, 0.6)',  // sepia 60%
];
```

> **Recordar**: en Inversiones, los sparklines no usan Recharts — son SVG inline (Paso 5).

---

## Mocks que el handoff NO diseñó (implementar dentro del sistema)

De [[source-handoff-readme]] § 8. **Inventar respetando el lenguaje del sistema, no improvisar nuevo**:

- Estados vacíos por sección (sin transacciones, sin metas, sin inversiones) → frase en serif italic ("La página de hoy está en blanco.").
- Loading skeletons → componente `skeleton.tsx` ya queda migrado en Paso 2 (shimmer en `--sepia-soft`).
- Estados de error de red → toast wine + retry sugerido.
- Notificaciones in-app (lista al clickear campana).
- Tab "Aportes" del modal de meta (sólo se diseñó "Plan").
- Modal de detalle de transacción (click sobre una tx).
- Búsqueda global / command palette (⌘K).

---

## Tech-debt de lint (no es parte de la migración pero conviene atacarlo)

Detectado en [[log]] al verificar el Paso 1 — 13 errores + 5 warnings preexistentes:

- `react-refresh/only-export-components` en `components/ui/{badge,button,toast}.tsx` y `router/index.tsx` → mover variant maps / constantes a archivos separados.
- `@typescript-eslint/no-empty-object-type` en `components/ui/input.tsx` → reemplazar interface vacía por `type Foo = SuperType`.
- `@typescript-eslint/no-explicit-any` en 4 Pages (`GoalDetailPage`, `GoalsPage`, `InvestmentsPage`, `TransactionsPage`) → tipar correctamente; los `// eslint-disable-next-line` son unused (la versión nueva del plugin reconoce el any sin necesidad del disable).
- Warning `react-hooks/incompatible-library` en `TransactionsPage.tsx:62` → `useForm().watch()` no se puede memoizar; considerar `useWatch` directo.

**Sugerencia**: aprovechar el Paso 2 (reescritura de componentes UI) para limpiar también los errores de `components/ui/*`. Los de `features/*Page.tsx` se naturalmente atacan al migrar cada página en el Paso 4.

---

## Cómo cerrar la sesión cuando termines

1. Logear en [[log]] qué pasos se aplicaron, con citas verbatim del título de los commits.
2. Actualizar la tabla "Estado de implementación" en [[source-design-handoff-cuaderno]] (marcar ✅ los pasos hechos).
3. Si se descubrieron decisiones nuevas en el camino, crear página en `decisions/`.
4. Si esta página de roadmap deja de reflejar el próximo paso real, actualizar la sección "Próximo".
