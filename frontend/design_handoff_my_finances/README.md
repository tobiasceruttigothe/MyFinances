# Handoff · My Finances · Sistema "Cuaderno"

Bundle de diseño para aplicar la nueva identidad visual al repositorio
[`tobiasceruttigothe/MyFinances`](https://github.com/tobiasceruttigothe/MyFinances).
Diseñado en Anthropic Skills (Claude Sonnet 4.5) — esta carpeta es la
referencia para implementarlo en el código real.

---

## 1 · Sobre los archivos de este bundle

Los archivos `.html` y `.jsx` que están acá son **referencias de diseño
construidas como prototipos HTML/React standalone**. NO son código para copiar
y pegar a producción.

Tu tarea es **recrear estos diseños dentro del frontend existente del repo**
(`frontend/`, React 19 + TypeScript + Vite + Tailwind v4 + shadcn/ui + Radix +
Recharts), siguiendo los patrones del codebase y las dependencias ya instaladas.

El archivo más importante de todos es **`design-system.html`** — es el manual
oficial del sistema, con todos los tokens, los componentes base con código
TypeScript copiable, los patrones recurrentes, y una **tabla de migración
archivo por archivo** del repo actual. Empezá por ahí.

---

## 2 · Fidelidad

**Alta fidelidad (hi-fi).** Los mockups están con colores finales, tipografía
final, espaciado final y todos los estados visualizados. Implementación
pixel-perfect siguiendo los tokens documentados en `design-system.html`.

---

## 3 · Estructura del bundle

```
design_handoff_my_finances/
├── README.md                          ← estás acá
├── design-system.html                 ← ★ MANUAL OFICIAL · empezar acá
│
├── canvas/                            ← el canvas con todos los mockups
│   ├── index.html
│   ├── design-canvas.jsx              (infraestructura — ignorar)
│   ├── ios-frame.jsx                  (infraestructura — ignorar)
│   ├── shared.jsx                     ← datos de ejemplo (copys, números)
│   ├── cuaderno-system.jsx            ← Sidebar + Page shell + primitives
│   ├── direction-a.jsx                ← Dashboard, Inversiones, Transacciones
│   ├── screens-reports-goals.jsx      ← Reportes + Metas (lista + detalle)
│   ├── screens-categories-profile.jsx ← Categorías + Profile
│   ├── screens-auth.jsx               ← Login + Register
│   ├── screens-mobile.jsx             ← 7 pantallas mobile iOS
│   ├── screens-onboarding.jsx         ← 5 pasos desktop + 3 mobile
│   ├── screens-overlays.jsx           ← Modales + bottom sheets + toasts
│   └── mount.jsx                      (cómo se ensambla — referencia)
```

Para previsualizar visualmente cualquier archivo: abrir `canvas/index.html` en
un browser local. Para leer el sistema: abrir `design-system.html`.

---

## 4 · Identidad visual · resumen ejecutivo

**El sistema se llama "Cuaderno".** El concepto: la app es un cuaderno
personal de cuentas, no un dashboard tipo banca tradicional.

Dos paletas:

- **Papel** — fondo crema `#f4ecdd`, tinta `#1a1612`, acentos sepia/sage/wine.
  Para uso diario (Dashboard, Transacciones, Categorías, Reportes, Metas, Auth,
  Profile, Onboarding).
- **Tinta** — fondo azul profundo `#1f2a38`, texto cream `#ecdfbd`. Sólo para
  el panel de Inversiones — "el cuaderno encuadernado en azul oscuro".

**Tipografía:**

- `Newsreader` (serif editorial) → títulos, números importantes, citas
- `Hanken Grotesk` (sans humanista) → UI funcional, body, botones
- `JetBrains Mono` → fechas, montos crudos, tickers de inversiones

**Tokens completos:** ver sección "Tokens CSS" en `design-system.html`.

---

## 5 · Estado del repo actual

Lo que está hoy en `frontend/` (commit `291c1db15c`, branch `main`):

- React 19 + TypeScript + Vite 7
- Tailwind CSS v4 (con `@tailwindcss/vite`)
- shadcn/ui con paleta default (azul `#3b82f6` como `--primary`)
- Radix UI primitives
- React Hook Form + Zod
- TanStack Query
- Recharts
- React Router DOM 7
- Zustand
- Lucide React icons

Lo que hay que cambiar: **toda la capa visual**. La lógica de las páginas
(hooks de React Query, mutations, validaciones) se mantiene casi intacta —
sólo cambia el JSX renderizado y los tokens CSS.

---

## 6 · Plan de migración recomendado

> Esto está documentado más en detalle en la sección **"Migración del repo
> actual"** de `design-system.html`, con una tabla archivo por archivo. Esto
> es el resumen para que sepas por dónde arrancar.

### Paso 1 · Tokens CSS y fuentes (≈30 min)

1. Reemplazar el contenido completo de `frontend/src/index.css` con el bloque
   que está en la sección **"Tokens CSS"** del design-system. Usa Tailwind v4
   `@theme` para exponer los colores como utilities (`bg-paper`, `text-ink`,
   `border-rule`, etc).
2. Agregar al `<head>` de `frontend/index.html` el `<link>` a Google Fonts
   (Newsreader + Hanken Grotesk + JetBrains Mono).
3. Eliminar todos los selectores `.dark` del CSS actual — el modo oscuro como
   tal no se usa; "Tinta" es una sección, no un modo global.

### Paso 2 · Componentes base (≈2-3 hrs)

Reescribir estos archivos en `frontend/src/components/ui/`. El código TS
copiable está en cada componente del design-system:

- `button.tsx` → variantes `ink · outline · ghost · danger`
- `input.tsx` → línea inferior estilo cuaderno, no caja
- `card.tsx` → PaperCard simple (sin Header/Content/Footer separados)
- `badge.tsx` → variantes `sepia · sage · wine · ink`
- `toast.tsx` → tira de papel con borde-left de color (4px), serif italic
- `skeleton.tsx` → cambiar el shimmer gris por `var(--sepia-soft)`

### Paso 3 · Layout global · AppLayout (≈30 min)

Rehacer `frontend/src/components/shared/AppLayout.tsx`:

- Sidebar de 224px con borde sepia a la derecha
- Items en serif `Newsreader`, no íconos Lucide
- Item activo: fondo `var(--color-ink)`, texto `var(--color-paper)`, italic, con `❧`
- Logo: `MyFinances` en serif 22px, punto `.` en wine
- Footer del sidebar: cita en serif italic sepia

Ver `cuaderno-system.jsx` (función `CuadernoSidebar`) y `direction-a.jsx`
(función `ADaily`) para la implementación de referencia.

### Paso 4 · Páginas, una por una

Cada página toma ~30-60 min. Orden sugerido:

1. **Dashboard** (`features/dashboard/DashboardPage.tsx`) — referencia: `direction-a.jsx · ADaily()`
2. **Transacciones** (`features/transactions/TransactionsPage.tsx`) — referencia: `direction-a.jsx · ATransactions()`
3. **Reportes** (`features/reports/ReportsPage.tsx`) — referencia: `screens-reports-goals.jsx · ReportsScreen()`
4. **Categorías** (`features/categories/CategoriesPage.tsx`) — referencia: `screens-categories-profile.jsx · CategoriesScreen()`
5. **Metas** lista + detalle (`features/goals/`) — referencia: `screens-reports-goals.jsx · GoalsScreen() + GoalDetailScreen()`
6. **Profile** (`features/auth/ProfilePage.tsx`) — referencia: `screens-categories-profile.jsx · ProfileScreen()`
7. **Login + Register** (`features/auth/`) — referencia: `screens-auth.jsx · LoginScreen() + RegisterScreen()`

### Paso 5 · Inversiones · paleta Tinta (≈45 min)

Es la única página que usa la paleta oscura. Estrategia recomendada:

- Wrappear la página con `data-mode="tinta"` o agregar una clase `tinta` al root.
- En `index.css`, dentro de `data-mode="tinta"` (o `.tinta`), redefinir las
  variables: `--color-paper: var(--color-tinta-bg)`, `--color-ink: var(--color-tinta-ink)`, etc.
- Así, los mismos componentes (Card, Button, Input) "se adaptan" automáticamente
  al cambiar las variables.

Referencia: `direction-a.jsx · AInvest()` y la paleta `INVEST_PALETTES.tinta`.

### Paso 6 · Overlays y mobile

- Modales: ver `screens-overlays.jsx`. Usar Radix Dialog (ya instalado).
  Aplicar el chrome paper: borde sepia, sombra cálida, fondo papel con radial gradient.
- Bottom sheets para mobile: idem pero con animación slide-up desde abajo y handle.
- Toasts: ver `screens-overlays.jsx · ToastDemo()`. Usar Radix Toast (ya instalado).

### Paso 7 · Recharts

Reemplazar el array de colores actual `['#3b82f6', '#10b981', ...]` por:

```ts
const COLORS = [
  'var(--color-sepia)',
  'var(--color-sage)',
  'var(--color-wine)',
  'var(--color-gold)',
  'rgba(26, 22, 18, 0.6)',  // ink 60%
  'rgba(124, 90, 42, 0.6)', // sepia 60%
];
```

Para sparklines en Inversiones: **NO usar recharts**, hacer SVG inline (más
limpio, menos overhead). Ver `direction-a.jsx · NightSparkline()`.

---

## 7 · Decisiones de diseño importantes a respetar

Estas son las decisiones que dan personalidad al sistema. Si las perdés, se
convierte en un dashboard genérico más.

- **El borde inferior de los inputs en lugar de caja completa.** Línea de cuaderno.
- **Los números importantes en serif** (`Newsreader`), no en sans. Balance, ROI, montos hero.
- **Los ROI y porcentajes en serif italic** cuando son evaluativos ("+ 25.8%").
- **Las fechas y montos crudos en mono** (`JetBrains Mono`). Da sensación de "ledger".
- **El item activo del sidebar tiene un `❧`** (fleurón) y va en italic. No subrayado, no badge azul.
- **Estado vacío con frase en serif italic** ("La página de hoy está en blanco."), no ícono triste.
- **Toasts como tiras de papel con borde-left de 4px**, no rectángulos pastel.
- **Confirmaciones destructivas piden tipear `ELIMINAR`** para acciones grandes (borrar meta con historial). Fricción proporcional al daño.
- **Categorías con glifos editoriales** (❧ ✦ ◐ ◯ ◇) en lugar de emoji cuando sea posible. Mantiene el tono.
- **El cuadro del balance principal NO es un gradient azul** — es la paper card con el número en serif gigante.

---

## 8 · Mocks que NO se implementaron

Estos casos quedaron sin pantalla diseñada — implementalos siguiendo el
sistema documentado, no inventes lenguaje nuevo:

- Estados vacíos por sección (sin transacciones, sin metas, sin inversiones)
- Loading skeletons
- Estados de error de red
- Notificaciones in-app (lista al clickear la campana)
- Tab "Aportes" del modal de meta (sólo se diseñó la tab "Plan")
- Modal de detalle de transacción (click sobre una tx)
- Búsqueda global / command palette (⌘K)

---

## 9 · Datos de ejemplo

Los números que ves en los mockups vienen de `shared.jsx`. Son datos
ilustrativos en pesos argentinos. La implementación real obviamente usa los
hooks de TanStack Query que ya están en `frontend/src/api/`.

---

## 10 · Cómo arrancar

Si sos un Claude Code agente leyendo esto:

1. Leé `design-system.html` completo. Es el manual.
2. Mirá los archivos `.jsx` del canvas para entender cómo se ven las pantallas
   ensambladas — abrí `canvas/index.html` en un browser local si necesitás
   verlo renderizado.
3. Hacé el Paso 1 (tokens) y verificá que la app sigue compilando.
4. Hacé el Paso 2 (componentes base) en una sola sentada. Una vez que los 6
   componentes están migrados, gran parte del cambio visual se hace solo.
5. Migrá las páginas una por una. Hacé un commit por página.
6. Inversiones la dejás para el final, con el truco de las CSS variables.

---

*Diseñado en mayo 2026 · sistema "Cuaderno" v1*
