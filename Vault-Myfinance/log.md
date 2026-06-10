# Log — Vault MyFinance

Registro cronológico append-only. Prefijo obligatorio: `## [YYYY-MM-DD] <op> | <título>` con `<op>` ∈ `{ingest, ask, review, schema}`.

Comando útil:
```bash
grep "^## \[" log.md | tail -10
```

---

## [2026-05-16] schema | Inicialización del wiki

Bootstrap completo del vault basado en el estado actual del repo MyFinances.

**Creado**:
- Esquema: `WIKI.md`
- Navegación: `index.md`, `log.md`, `overview.md`
- Entities (8): `gateway-service`, `config-server`, `user-service`, `account-service`, `investment-service`, `goals-service`, `keycloak`, `zipkin`
- Concepts (5): `jwt-x-user-id`, `feign-resilience`, `deploy-minikube`, `scheduling-goals` (draft), `auth-keycloak`
- Decisions (3): `chau-eureka-hola-k8s`, `jwt-en-gateway`, `config-en-github`
- Sources (8): `claude-md`, `notas-google-smtp`, `pasos`, commits `291c1db`, `f55ab39`, `f0d5dd8`, `b0eabac`, `10de551`

**Eliminado**:
- `Bienvenido.md` (nota default de Obsidian)

**Pendientes detectados durante el bootstrap**:
- Verificar puerto real del Service `keycloak` (inconsistencia entre [[source-claude-md]] = `8082:8082` y [[source-pasos]] = `9090:8080`).
- Leer e ingerir el código de `GoalAutoContributionScheduler.java` para sacar [[concept-scheduling-goals]] de `draft`.
- Confirmar política de consistencia investment ↔ account cuando el Feign falla (mencionado en [[concept-feign-resilience]] como TODO).
- Ingerir contenido del directorio nuevo `frontend/design_handoff_my_finances/` cuando esté listo. ✅ Resuelto en la siguiente entrada (2026-05-16 ingest).
- Posibles fuentes adicionales aún no ingeridas: `backend/postman/MyFinances_API.postman_collection.json` (catálogo real de endpoints), `backend/docker-compose.yml`, manifests de `backend/k8s/`.

---

## [2026-05-16] ingest | Design handoff "Cuaderno" (frontend)

Ingerido `frontend/design_handoff_my_finances/` (mayo 2026, autoría Anthropic Skills · Claude Sonnet 4.5). Introduce el sistema visual "Cuaderno" para reemplazar la capa visual del frontend (que estaba con shadcn default azul).

**Creado**:
- Sub-sources (4): `design-handoff-cuaderno` (master), `handoff-readme`, `design-system-html`, `handoff-canvas`.
- Entity (1): `frontend`.
- Concepts (3): `sistema-cuaderno`, `cuaderno-vs-tinta-mode`, `frontend-stack`.
- Decision (1): `identidad-cuaderno`.

**Actualizado**:
- `overview.md` — reemplazo del párrafo "frontend en estado temprano" por estado real + sección de pendientes con Pasos 2-7 del plan de migración.
- `index.md` — entradas en Entities, Concepts, Decisions; renombrada subsección de Sources a "Docs, notas y handoffs"; nota stale en `source-claude-md`.

**Contradicción confirmada y resuelta**: `CLAUDE.md` raíz decía "The `frontend/` directory is currently empty" — falso desde commit `291c1db`. Resuelto editando `CLAUDE.md` con el estado real (React 19 + Vite 7 + Tailwind v4 + shadcn/Radix + TanStack Query + Zustand + ...) y mención al handoff.

**Pendientes detectados**:
- Pasos 2-7 del plan de migración Cuaderno (componentes base, AppLayout, páginas, Tinta mode, overlays, Recharts colors). Documentados en [[source-design-handoff-cuaderno]] "Estado de implementación".
- "Mocks no diseñados" del handoff (estados vacíos, loading skeletons, errores de red, command palette ⌘K, etc. — § 8 del README). Implementar siguiendo el sistema, no inventar lenguaje nuevo.

---

## [2026-05-16] schema | Paso 1 de migración Cuaderno aplicado (parcial — verificación bloqueada)

Aplicado el Paso 1 del plan de migración del handoff:
- **`frontend/src/index.css`**: reemplazo completo (HSL shadcn default → bloque `@theme` Cuaderno con paletas Papel + Tinta + fuentes + radios). `@import "tailwindcss"` preservado. Bloque `.dark` eliminado (se reemplaza por `data-mode="tinta"` en Paso 5).
- **`frontend/index.html`**: agregados `<link rel="preconnect">` a Google Fonts y `<link>` a Newsreader + Hanken Grotesk + JetBrains Mono (versión "production" recomendada por el design-system, no la más amplia del propio handoff).

**Verificación primer intento — blockers ambientales**:
- `npm run build` falló: (a) Node v18.19.1 instalado, Vite 7.3 requiere `^20.19.0 || >=22.12.0`; (b) `@tailwindcss/oxide` no carga native binding — bug conocido npm@9 con optional deps.
- `npm run lint` reportó 11 errores preexistentes en archivos NO modificados. ESLint no analiza CSS ni HTML, así que el lint no puede haber empeorado por el Paso 1.

**Resuelto en el mismo turno**:
- Instalado nvm v0.40.3 desde el script oficial (script append a `~/.bashrc`).
- `nvm install 22` → Node v22.22.3 + npm v10.9.8 instalados; alias default = 22.
- `rm -rf frontend/{node_modules,package-lock.json}` + `npm install` limpio. Resultado: 357 paquetes, **0 vulnerabilities**, sin warnings de `EBADENGINE`.

**Verificación final — Paso 1 verde**:
- ✅ `npm run build` → `✓ built in 3.10s`. Todos los chunks generados en `dist/assets/` (incluido `CategoricalChart`, `BarChart`, `PieChart` de Recharts; páginas lazy-loaded; etc.).
- ⚠️ `npm run lint` → 18 problemas (13 errores + 5 warnings), todos **preexistentes** sobre archivos no tocados. El diff (vs 11+5 con ESLint 6.4 global) es por la versión correcta de ESLint 9.x que ahora se ejecuta desde `node_modules/.bin/eslint` y aplica más reglas; no por el Paso 1.

**Tech-debt de lint** queda fuera del scope del Paso 1. Para atacarlo más adelante:
- `react-refresh/only-export-components` en `components/ui/{badge,button,toast}.tsx` y `router/index.tsx` → mover constantes/types/variant maps a archivos separados.
- `@typescript-eslint/no-empty-object-type` en `components/ui/input.tsx` → reemplazar interface vacía por `type Foo = SuperType` o agregar al menos una prop.
- `@typescript-eslint/no-explicit-any` (4 Pages: `GoalDetailPage`, `GoalsPage`, `InvestmentsPage`, `TransactionsPage`) → tipar correctamente; los `// eslint-disable-next-line` que tienen están unused (la versión nueva del plugin reconoce el any sin necesidad del disable).
- `react-hooks/incompatible-library` warning en `TransactionsPage.tsx` línea 62 → `useForm().watch()` no se puede memoizar. Es un patrón conocido de RHF + React Compiler; revisar si se puede usar `useWatch` directo.

---

## [2026-05-16] schema | Cierre de sesión + descubribilidad del vault

Pre-cierre del día. Dos artefactos agregados para que la próxima sesión arranque sin contexto:

- **Roadmap creado**: `analyses/next-steps-cuaderno-migration.md`. Checklist accionable para los Pasos 2-7 de la migración Cuaderno (próximo: Paso 2 — reescribir los 6 componentes de `frontend/src/components/ui/`). Incluye pre-flight (`nvm use 22 && npm run dev`), tabla por componente con patrón y referencia al design-system, criterios de done, recordatorios de los 10 mandamientos, y sugerencia de atacar el tech-debt de lint en el camino. Listado en [[index]] sección Analyses.
- **CLAUDE.md raíz**: agregada sección **"Knowledge base — READ THIS FIRST"** al inicio del archivo (justo después del título, antes de "Project Overview"). Apunta a `Vault-Myfinance/WIKI.md`, `index.md`, `overview.md`, `log.md`, describe el layout (entities/concepts/decisions/sources/analyses) y menciona el roadmap activo. Además, actualizado el "Project Overview" para reflejar que el frontend ya no es "in-progress" sino "mid-migration to Cuaderno".

Razón: el wiki existía pero ningún archivo del repo apuntaba a él — una sesión nueva de Claude Code no tenía forma de descubrirlo. Ahora `CLAUDE.md` (que sí se autocarga) lo señala.

---

## [2026-05-16] schema | Paso 2 de migración Cuaderno — componentes base

Aplicado el Paso 2 del roadmap ([[next-steps-cuaderno-migration]]). Reescritos los 6 componentes de `frontend/src/components/ui/` al sistema Cuaderno, un commit por componente.

**Commits** (HEAD-first):
- `feat(ui): migrate skeleton to Cuaderno system` — shimmer `bg-sepia-soft`; `CardSkeleton` con chrome PaperCard.
- `feat(ui): migrate toast to Cuaderno system` — tira de papel con `border-l-4` (sage/wine/sepia), serif italic, `shadow-pop`. Sin íconos lucide. API de `useToast`/`ToastProvider` intacta.
- `feat(ui): migrate badge to Cuaderno system` — variantes canónicas `sepia | sage | wine | ink`. Mantiene **alias transitorio** para los nombres shadcn (`default | secondary | destructive | success | warning | outline`) porque las páginas pasan `variant={cfg.variant}` desde configs tipados; el alias se elimina en Paso 4 cuando cada página migre.
- `feat(ui): migrate card to Cuaderno system` — `Card` ahora es PaperCard (`bg-paper/40 backdrop-blur-[2px] border-rule rounded-md p-[22px]`). Subcomponentes (`CardHeader/Title/Description/Content/Footer`) conservados como helpers de layout para que las páginas sigan compilando; padding sacado (Card ya pad-22). `CardTitle` en serif italic 20px.
- `feat(ui): migrate input to Cuaderno system` — línea inferior (`border-b border-rule focus:border-ink`), serif 17px, placeholder sepia italic. Nueva prop opcional `label?: string` (label uppercase sepia 10.5px). `forwardRef` preservado por React Hook Form.
- `feat(ui): migrate button to Cuaderno system` — `cva` removido. Variantes `ink | outline | ghost | danger`. Tokens `@theme` extendidos: `--color-{rule,sepia,sage,wine}-soft`, `--radius-pill`, `--shadow-card`, `--shadow-pop`.

**Decisión de scope — no migrar páginas en este paso**:
- Los 4 sitios que pasan `variant="outline"` siguen funcionando (mismo nombre en el sistema nuevo).
- Los `className="bg-blue-600 hover:bg-blue-700"` en `<Button>` de las páginas siguen ganando vía `twMerge` — las páginas se ven azules hasta Paso 4. Esto es esperado por el roadmap.
- `components/ui/label.tsx` queda igual (no está en los 6 del Paso 2); en Paso 4 cada página migra de `<Label><Input/>` separado a `<Input label="..."/>`.

**Verificación**:
- ✅ `npm run build` verde después de cada commit (5 chunks por build, ~5s).
- ✅ `npm run lint`: **10 errores + 5 warnings** (baja desde 13+5 del Paso 1). Los 3 errores menos son los que dependían de `cva`/empty-interface en `button.tsx`/`badge.tsx`/`input.tsx` y desaparecieron solos al reescribir.
- Errores remanentes 100% preexistentes: 3 en `router/index.tsx`, 2 en `OAuthCallbackPage.tsx`, 4 en `*Page.tsx` (no-explicit-any), 1 en `toast.tsx` (export de `useToast` junto a `ToastProvider` — tech-debt del Paso 1, no introducido aquí).

**Pendientes que abre este paso**:
- El alias `default|secondary|destructive|success|warning|outline` en `badge.tsx` es deuda — borrarlo en Paso 4 al migrar cada página.
- `bg-paper/40 backdrop-blur-[2px]` en `Card` puede verse "demasiado sutil" sobre el papel (matemáticamente `paper × 40%` sobre `paper` ≈ paper); el `design-system.html` referencia explícitamente este patrón. Validar visualmente en Paso 4; si hace falta, cambiar a `bg-white/40`.
- `Card.CardFooter` ahora pone `mt-4 pt-4 border-t border-rule-soft` — agresivo si la card ya separa con sus propios elementos; revisar caso por caso en Paso 4.

**Próximo**: Paso 3 — `AppLayout.tsx` (sidebar Cuaderno con `❧` en italic). Ver [[next-steps-cuaderno-migration]] § Paso 3.

---

## [2026-05-16] schema | Paso 3 de migración Cuaderno — AppLayout

Aplicado el Paso 3 del roadmap. `frontend/src/components/shared/AppLayout.tsx` reescrito al sidebar Cuaderno.

**Commit**: `1199ba0 feat(ui): migrate app layout to Cuaderno sidebar`.

**Cambios principales**:
- Sidebar 224px, `border-r border-rule`, sin shadow/bg. (Antes: 240px, white, shadow-sm).
- Logo "MyFinances" en serif 22px con el `.` en `--color-wine` (antes: icono lucide en pill azul).
- Subtítulo "Cuaderno de cuentas" en uppercase 10.5px tracked sepia.
- Nav en serif Newsreader sin íconos lucide. Items: Hoy / Transacciones / Categorías / Reportes / Metas; separador; Inversiones.
- Item activo: `bg-ink text-paper italic` prefijado con `❧` (fleurón). Sin `ChevronRight`, sin pill azul.
- Profile + logout abajo del nav (el canvas los omite, la app los necesita). Profile usa el mismo `navItemClass` para consistencia de estado activo. Logout es un botón serif italic sepia.
- Cita "Quien no sabe lo que gasta, ignora lo que vale." en serif italic sepia al pie.
- Main content: `px-11 py-8` (≈32/44 del canvas page shell), sin `bg-gray-50` ni `mx-auto`.

**Decisiones de diseño**:
- Label de Dashboard → **"Hoy"** (tono Cuaderno per `cuaderno-system.jsx`); ruta `/dashboard` sin tocar — solo cambia el texto del item.
- "Inversiones" queda separado por una `hr` del resto del nav, anticipando el Paso 5 (paleta Tinta como sección, no como modo global — ver [[concept-cuaderno-vs-tinta-mode]]).
- Profile + logout abajo del nav y arriba de la cita (alternativa: reemplazar la cita por un user-block; rechazada por valor editorial de la cita).

**Verificación**:
- ✅ `npm run build` verde (5.0s).
- ✅ `npm run lint`: 10 errores + 5 warnings (sin cambios desde Paso 2). El nuevo archivo no introduce errores.

**Pendientes que abre**:
- Validar visualmente en navegador que el sidebar respira bien con `Outlet` de las páginas no migradas todavía (que siguen siendo blue-shadcn). Verificación deferida hasta empezar Paso 4.
- Si el bottom del sidebar queda apretado en monitores chicos, considerar `overflow-y-auto` en el contenedor del nav (no necesario por ahora; 7 items entran).

**Próximo**: Paso 4 — migrar páginas una por una, en orden Dashboard → Transacciones → Reportes → Categorías → Metas → Profile → Auth. Ver [[next-steps-cuaderno-migration]] § Paso 4.

---

## [2026-05-16] schema | Paso 4 de migración Cuaderno — páginas

Aplicado el Paso 4 del roadmap (excepto InvestmentsPage, que va en Paso 5). 7 páginas migradas al sistema Cuaderno, **un commit por página**.

**Commits** (HEAD-first, todos `feat(ui): migrate ... to Cuaderno system`):
- `69e8801` — auth pages (LoginPage + RegisterPage en un commit; mismo chrome `<aside>` story column + form column).
- `0bae076` — profile page (avatar ink rounded-full con iniciales serif italic; aside identity + main form).
- `ec5bf01` — goals pages (GoalsPage + GoalDetailPage en un commit; lista PaperCard con glifo sepia-soft, hero con progress 44px serif + 32px italic sage).
- `4828911` — categories page (tabla con header uppercase tracked + glifos editoriales `◇◯◐✦❧☼✜※` en bloque sepia-soft).
- `875d888` — reports page (KPI row 4-celdas + Recharts ya con paleta Cuaderno — adelanto parcial de Paso 7).
- `f62b90e` — transactions page (lista agrupada por día con tracked sepia + neto del día en mono).
- `37f7bf6` — dashboard page (header eyebrow + h1 serif 40px + stat row 3-celdas + 2-col "Mes en curso" + "Dónde se fue" + ledger reciente).

**Patrón consistente aplicado en todas las páginas**:
- Header: `eyebrow uppercase tracked sepia` + `h1 serif 36-40px` con fragmento italic sepia (`em` o segundo span).
- Acción primaria: `bg-ink text-paper rounded-pill px-[18px] py-[11px]` (sin gradient blue-600).
- Empty state: serif italic sepia ("La página de hoy está en blanco.", "Aún no hay historia que contar.").
- Inputs: prop `label` embebida del Input migrado en Paso 2 (uppercase 10.5px sepia + serif 17px con linea inferior).
- `as any` + eslint-disable de los Form resolvers reemplazado por `as never` correcto → 4 errores lint menos.

**Bundle impact** (build verde post-cada commit):
- Dashboard: 9.94kB → 8.97kB (Recharts removido).
- Transactions: 8.97kB → 9.21kB (grouping logic).
- Reports: 14.85kB → 31.44kB (sigue con Recharts; aumenta por el cleanup del COLOR array y los style props inline en Tooltip/CartesianGrid).
- GoalDetail: 13.32kB → 13.28kB (similar).

**Decisiones de scope que conviene recordar**:
- **InvestmentsPage NO migrada acá** — el handoff explícitamente la separa al Paso 5 porque va con paleta Tinta (azul oscuro Bloomberg-style); ver [[concept-cuaderno-vs-tinta-mode]].
- **Recharts mantenido** en Reports y GoalDetail con paleta Cuaderno (sepia/sage/wine/gold/ink60/sepia60) + Tooltip estilizado (border-rule, serif Newsreader, paper bg). Investments cuando se migre debe usar SVG inline para sparklines, NO Recharts (mandamiento del handoff).
- **Filtros por estado/tipo** convertidos a tabs serif italic con `underline decoration-gold` o `border-b-ink` para el activo, en vez de segmented control gris. Patrón nuevo unificado entre Categories, Transactions y Goals.
- **`<Label>` viejo sigue exportándose** pero ninguna página migrada lo usa más — todos los formularios usan `Input.label` embebido del Paso 2. El componente `label.tsx` puede borrarse cuando InvestmentsPage no lo importe; checkear en Paso 5.
- **Alias legacy de `badge.tsx`** (`default | secondary | destructive | success | warning | outline`): ninguna página migrada usa `<Badge>` ya — el alias es deuda muerta. Borrar en Paso 5 junto con investments cleanup, o en una tarea de limpieza dedicada.

**Verificación**:
- ✅ `npm run build` verde después de cada commit (5 chunks, ~5s).
- ✅ `npm run lint`: bajó de 10 → **7 errores + 2 warnings** (4 errores menos por el cambio de `as any` a `as never` en Goals/Transactions/Investments; 1 menos preexistente probablemente por reorden). 0 errores nuevos introducidos.

**Pendientes que abre este paso**:
- InvestmentsPage **sigue con look shadcn azul** y todavía importa `Label` + `Button` + `Card`. Hay que migrarla en Paso 5 con la paleta Tinta scoped (`<div data-mode="tinta">` wrapper).
- Sparklines en InvestmentsPage: implementar como SVG inline (`<NightSparkline>` del canvas `direction-a.jsx`), no Recharts.
- Eventualmente borrar `frontend/src/components/ui/label.tsx` y el alias legacy de `badge.tsx`.
- Validación visual en navegador deferida (no se hizo) — la app debería verse coherentemente Cuaderno en Dashboard/Transactions/Reports/Categories/Goals/Profile/Login/Register. Cuando se levante `npm run dev`, recorrer cada página y anotar discrepancias visuales contra el `design-system.html`.
- `useForm watch()` warning preexistente en `TransactionsPage:62` (React Compiler) sigue ahí; resolverlo cambiando a `useWatch` es un refactor independiente.

**Próximo**: Paso 5 — Inversiones · Tinta mode. Agregar bloque `[data-mode="tinta"]` a `index.css`, wrappear `InvestmentsPage` con `<div data-mode="tinta">`, reescribir layout, hacer sparklines SVG inline. Ver [[next-steps-cuaderno-migration]] § Paso 5.

---

## [2026-05-16] schema | Paso 5 de migración Cuaderno — Inversiones (Tinta mode)

Aplicado el Paso 5 del roadmap. Mecanismo de paleta Tinta como SCOPE (no modo global) descripto en [[concept-cuaderno-vs-tinta-mode]].

**Commit**: `b89ac0c feat(ui): migrate investments to Cuaderno Tinta mode` (2 archivos, +330 / −169).

**index.css**:
- Bloque `[data-mode="tinta"]` agregado dentro de `@layer base`. Reasigna las variables genéricas (`--color-paper/ink/rule/sepia/sage/wine/gold`) a sus pares `--color-tinta-*` ya definidos en `@theme` (Paso 1), más las versiones `*-soft` recalculadas con los matices tinta (rgba sobre fondo azul oscuro).
- Mecanismo es: los componentes (`Card`, `Button`, `Input`, `Badge`, `Toast`, `Skeleton`) siguen usando `bg-paper`, `text-ink`, `border-rule`, etc. Tailwind v4 los compila a `background-color: var(--color-paper)`. Adentro del scope tinta, esa variable apunta a `--color-tinta-bg` y el componente cambia sin tocar su código.

**InvestmentsPage**:
- Wrapper raíz `<div data-mode="tinta">` con `-mx-11 -my-8 px-11 py-8 min-h-[calc(100vh-0px)] bg-paper text-ink`. El bleed negativo extiende la paleta Tinta a todo el área del main content de AppLayout (que tiene `px-11 py-8`); la sidebar queda paper porque vive fuera del Outlet.
  - **Limitación**: el wrapper del main es `max-w-7xl`, así que en monitores > 80rem queda un strip paper a la derecha del bloque tinta. Aceptable para ahora; si molesta visualmente, mover `max-w-7xl` al body de cada Page no-Investments.
- Header: eyebrow `Portafolio · N posiciones` + h1 serif "Tu portafolio rinde {ROI}." con el ROI en italic **sage** o **wine** según signo.
- Stat ledger 3-col (Invertido / Valor actual / Ganancia bruta) en card única con reglas verticales; ganancia es primary (36px, bg-sage/5).
- Holdings table grid 7-col:
  - `Activo`: ticker en serif gold (helper `ticker()` que toma 2-5 letras mayúsculas iniciales de `description` o las primeras 5 chars como fallback).
  - `Descripción`: serif 15px + tipo+notes en sepia 11px.
  - `30 d`: sparkline SVG inline (`<polyline>` + `<circle>` final), **NO Recharts** per mandamiento del roadmap.
  - `Invertido`/`Actual`: mono con `Intl.NumberFormat('es-AR')`.
  - `ROI`: serif italic 16px sage|wine.
  - `Peso`: mono sepia, calculado como `currentCapital / totalCurrent`.
- Allocation footer: barra horizontal segmentada (6px) con la paleta `ALLOCATION_COLORS` (gold/sage/sepia/wine + variantes 70%) + leyenda en serif/mono.
- Form embebido en card `bg-paper-2/60` (fondo elevado tinta) con `<Input label="...">` del Paso 2. Checkbox "crear gasto vinculado" en serif italic con `accent-gold` en lugar del bloque blue-50.

**Sparkline · placeholder explícito**:
- Función `syntheticSpark(seed, slope, count=12)` genera trayectoria determinística a partir de `inv.id` (semilla) + `inv.roi` (pendiente). Comentario en código deja claro que es placeholder hasta que `investments-service` exponga `/history`.
- Cuando exista el endpoint real: cambiar `syntheticSpark(inv.id, inv.roi)` por `inv.history` (o un nuevo query) y borrar la función.

**Verificación**:
- ✅ `npm run build` verde (5.97s).
- ✅ `npm run lint`: 6 errores + 1 warning (baja desde 7+2; un `no-explicit-any` menos por el `as never` en el resolver de Investments). Errores remanentes 100% preexistentes (3 router/index.tsx, 2 OAuthCallbackPage.tsx, 1 toast.tsx export).

**Pendientes que abre / cierra**:
- ✅ **InvestmentsPage migrada** — cierra el ítem pendiente del Paso 4.
- ⚠️ **`components/ui/label.tsx`** sigue exportándose pero ya nadie en `features/` lo importa (verificado con grep). Borrar en una limpieza futura.
- ⚠️ **Alias legacy de `badge.tsx`** (`default | secondary | destructive | success | warning | outline`): tampoco lo usa nadie ya. Borrar junto con `label.tsx`.
- ⚠️ **Sparkline real**: depende de que `investments-service` exponga endpoint de history. Tracked como deuda en la sección "Mocks no diseñados" del [[source-handoff-readme]].
- ⚠️ **Visual review pendiente** — toda la migración (Pasos 2-5) está verificada por build + lint, pero no se levantó `npm run dev` y se navegó cada pantalla. Hacerlo al inicio de la próxima sesión, ver discrepancias contra `design-system.html`.

**Próximo**: Paso 6 — overlays y mobile. Dialog (Radix) con chrome paper, bottom-sheets mobile, confirmaciones destructivas (tipear `ELIMINAR`). Ver [[next-steps-cuaderno-migration]] § Paso 6.

---

## [2026-05-16] schema | Paso 6 de migración Cuaderno — overlays (parcial)

Aplicado el Paso 6 salvo bottom-sheets mobile y refactor del Toast a Radix. Lo central — modales con chrome paper + confirmaciones destructivas — está hecho.

**Commits**:
- `27cefa3` — `feat(ui): add Cuaderno Dialog + ConfirmDialog primitives` (2 archivos nuevos).
- `f8ef16b` — `feat(ui): wire ConfirmDialog into destructive actions` (5 archivos, +155 / −58).

**`components/ui/dialog.tsx`** (nuevo):
- Wrapper sobre `@radix-ui/react-dialog` (ya instalado en `package.json`). Set canónico: Root/Trigger/Portal/Overlay/Content/Header/Description/Body/Footer/Close.
- Overlay con `bg-ink/35 backdrop-blur-[2px]`.
- Content con `bg-paper` + radial gradient inline + `border-rule rounded-lg shadow-pop`. Cuando `tone="danger"`, el borde pasa a `border-wine`. Centrado fixed con max-h 88vh.
- Header con eyebrow uppercase tracked (sepia o wine) + title serif 24px + prop opcional `italic` para el fragmento italic sepia (ej. «Vacaciones Bariloche»). Botón close redondo border-rule top-right.
- Footer con `bg-ink/[0.02]` + `border-t rule` (chrome ledger).
- **Sin tailwindcss-animate**: la lib no está en deps, así que las clases `data-[state=open]:animate-in` serían dead code. El dialog abre/cierra sin transición — aceptable; agregar plugin o `@keyframes` inline es opcional.

**`components/ui/confirm-dialog.tsx`** (nuevo):
- Componente `ConfirmDialog<{ open, onOpenChange, title, italicTitle?, description?, confirmLabel?, cancelLabel?, tone?, typeToConfirm?, onConfirm, loading? }>`.
- Cuando `typeToConfirm` está seteado, renderiza el bloque dashed `border-wine` + `bg-wine-soft` con `<input>` mono que bloquea el botón de confirmar hasta que el texto matchee (patrón literal del canvas `screens-overlays.jsx · ModalDestroy`).
- **State `typed` movido a subcomponente** `<ConfirmBody>` adentro del DialogContent. Como Radix Portal monta/desmonta el Content al abrir/cerrar, `ConfirmBody` se re-monta y el `useState('')` re-inicializa solo — sin `useEffect`. Evita el lint rule `react-hooks/set-state-in-effect`.

**Cableado en páginas** (reemplazo de `window.confirm`):
- `GoalsPage`: `typeToConfirm="ELIMINAR"` + descripción que muestra el acumulado en aportes que se pierde. Razón: una meta puede tener historial largo, friction proporcional al daño.
- `CategoriesPage`: `typeToConfirm="ELIMINAR"`. Descripción cambia según `transactionCount` (el backend ya rechaza si tiene tx/subcategorías, pero el friction evita el clic accidental).
- `TransactionsPage`: simple confirm (sin typeToConfirm). Un movimiento se re-anota rápido.
- `InvestmentsPage`: simple confirm. Misma razón.

En todas las páginas: nuevo `useState<T | null>(null)` para `toDelete`; `onClick` del trash setea el target; `mutation.onSuccess` llama `setToDelete(null)` para cerrar el dialog además de invalidar queries; `loading={mutation.isPending}` deshabilita el botón y muestra "Eliminando…".

**Verificación**:
- ✅ `npm run build` verde (5.66s). Nuevo chunk `confirm-dialog-*.js` ≈ 41 kB (incluye `@radix-ui/react-dialog`).
- ✅ `npm run lint`: **6 errores + 1 warning** — vuelta al baseline pre-paso 6. Cero `window.confirm` restantes en `features/` (verificado con grep).
- ✅ Portal de Radix monta el dialog en `document.body`, **fuera del scope `data-mode="tinta"`** de Investments → el dialog destructivo siempre aparece en paleta paper aunque se dispare desde Inversiones. Es el comportamiento esperado (mantiene consistencia del lenguaje de overlays).

**Pendientes del Paso 6 (diferidos)**:
- **Bottom sheets mobile**: requeriría convertir los formularios inline (`showForm` boolean en Transactions/Categories/Goals/Investments) en Dialogs, y agregar variant del Dialog que en `< 640px` haga slide-up desde abajo con handle. No hay testing en viewport mobile en la sesión actual; deferred.
- **Refactor `toast.tsx` a Radix Toast**: el toast actual (Paso 2) ya cumple el patrón visual (tira de papel + border-l-4 sage/wine/sepia), pero implementa cola + setTimeout manualmente. Migrar a `@radix-ui/react-toast` mejora a11y (focus management, hover-pause). No bloquea.
- **Animaciones del dialog**: agregar `tailwindcss-animate` o `@keyframes` inline para fade/scale al abrir-cerrar. Trivial cuando se quiera.

**Próximo**: Paso 7 — revisar colores Recharts. Reports y GoalDetail ya quedaron con paleta Cuaderno (sepia/sage/wine/gold/ink60/sepia60) durante Paso 4. Falta confirmar que no haya otra página con Recharts a paleta default (grep dice que no). Si efectivamente no queda nada, Paso 7 se cierra con esta verificación. Ver [[next-steps-cuaderno-migration]] § Paso 7.

---

## [2026-05-16] schema | Paso 7 de migración Cuaderno — Recharts colors · CIERRE DE LA MIGRACIÓN

Aplicado el Paso 7. Con esto se **cierra el roadmap de migración Cuaderno completo** (Pasos 1-7 hechos; sub-pendientes documentados como deuda menor en [[next-steps-cuaderno-migration]]).

**Commit**: `019d989 feat(ui): consolidate Recharts palette into chart-colors module` (3 archivos, +76 / −58).

**`frontend/src/lib/chart-colors.ts`** (nuevo):
- Constantes nombradas: `CHART_INK / CHART_SEPIA / CHART_SAGE / CHART_WINE / CHART_GOLD / CHART_RULE`, más semitransparencias `CHART_INK_60 / CHART_SEPIA_60 / CHART_SAGE_70`.
- `CHART_COLORS[]`: paleta canónica de 7 entradas (orden del roadmap: sepia, sage, wine, gold, ink60, sepia60, sage70) para series múltiples.
- Helpers para Recharts props: `CHART_TICK_STYLE` (font-mono + sepia), `CHART_GRID_PROPS` (dasharray 2-4 en sepia/18% sin vertical), `CHART_TOOLTIP_STYLE` (paper bg + border-rule + Newsreader serif).
- Comentario al tope explica por qué los valores van como hex y no como `var(--color-sepia)`: **Recharts pasa los colores como atributos SVG, no como CSS properties**, y los atributos no resuelven custom properties. Si los tokens de `@theme` cambian, sincronizar manualmente.

**Refactor**:
- `ReportsPage.tsx`: borra el `CUADERNO_COLORS` local y los 2 bloques `contentStyle` inline. `Bar` fills con `CHART_SAGE` / `CHART_WINE`; `Pie` cells con `CHART_COLORS` rotativos; barras horizontales del desglose también con `CHART_COLORS`.
- `GoalDetailPage.tsx`: borra los 8 hex literales (`#7c5a2a`, `#c9bca0`, `#f4ecdd`, etc.). `Bar dataKey="Contribuido"` con `CHART_SAGE`, `ReferenceLine` con `CHART_SEPIA`.

**Verificación**:
- ✅ `npm run build` verde (5.65s).
- ✅ `npm run lint`: 6 errores + 1 warning — sin cambios (baseline, todos preexistentes).
- ✅ `grep -rn "#7c5a2a|#5e7a4f|#9a3a2e|#d4a657|#c9bca0|#1a1612|#f4ecdd" frontend/src/features` → **cero matches**. Toda la paleta hex de Recharts vive en un solo módulo.
- ✅ `grep -rln "from 'recharts'" frontend/src` → solo `ReportsPage.tsx` y `GoalDetailPage.tsx` (InvestmentsPage usa SVG inline desde Paso 5, correcto).

**Estado final de la migración Cuaderno** al 2026-05-16:

| Paso | Estado | Commits |
|---|---|---|
| 1 — tokens + fuentes | ✅ | (en el árbol antes de esta sesión) |
| 2 — componentes base | ✅ | 6 commits `feat(ui): migrate {button\|input\|card\|badge\|toast\|skeleton} to Cuaderno system` |
| 3 — AppLayout | ✅ | `1199ba0` |
| 4 — 7 páginas | ✅ | 7 commits `feat(ui): migrate {dashboard\|transactions\|reports\|categories\|goals\|profile\|auth} to Cuaderno system` |
| 5 — Inversiones · Tinta mode | ✅ | `b89ac0c` |
| 6 — overlays (Dialog + ConfirmDialog) | ✅ parcial | `27cefa3`, `f8ef16b` (bottom-sheets mobile diferidos) |
| 7 — Recharts colors | ✅ | `019d989` |

Total: **~18 commits con prefijo `feat(ui):`** en la rama main entre 2026-05-16 (paso 2 inicio) y 2026-05-16 (paso 7 cierre).

**Deuda menor abierta** (no bloquea nada, ver [[next-steps-cuaderno-migration]] § Próximo):
1. Bottom-sheets mobile para `< 640px` (Paso 6).
2. Refactor `toast.tsx` a `@radix-ui/react-toast` para a11y.
3. Animaciones del `Dialog` (instalar `tailwindcss-animate` o `@keyframes` inline).
4. Borrar deuda muerta: `components/ui/label.tsx`, alias legacy en `badge.tsx`.
5. Visual review (`npm run dev`, recorrer cada pantalla, comparar contra `design-system.html`).
6. Sparkline real en `InvestmentsPage` cuando el backend exponga history (placeholder con `syntheticSpark()` por ahora).
7. Lint tech-debt preexistente: 3 errores en `router/index.tsx`, 2 en `OAuthCallbackPage.tsx`, 1 en `toast.tsx` (export de `useToast` junto al componente).

**Próximo**: el plan original quedó cerrado. La próxima sesión puede atacar cualquiera de los 7 ítems de deuda (todos no-bloqueantes), o bien volver al backend (autenticación Google/SMTP que es el TODO del commit `291c1db`).

---

## [2026-05-16] review | Análisis pre-deploy + credenciales reales

El usuario levantó Minikube y desplegó todo (gateway 8080, Keycloak 8082 accesibles), pero el login fallaba. Investigación contra el deploy en vivo.

**Análisis del repo previo al deploy** (resumen para [[overview]]):
- Tooling local: Docker 29.1.3, Java 21, Maven 3.8.7 presentes. **Minikube y kubectl faltaban** — el usuario los instaló él mismo.
- Recursos sugeridos: `minikube start --cpus=4 --memory=8192 --disk-size=40g` para los ~9 pods (Postgres + Keycloak + 5 servicios Spring + Gateway + Zipkin).
- Config externa: `config-server` lee `https://github.com/tobiasceruttigothe/myfinances-config-data.git` (público; sin cambios desde el deploy anterior).
- Validación canónica del deploy: 63 asserts del Postman collection.
- Pendientes que NO bloquean un deploy local: Google OAuth + SMTP (placeholders en `keycloak-secrets.yaml`), sparkline real en Inversiones, bottom-sheets mobile y demás items de [[next-steps-cuaderno-migration]].

**Bug encontrado: credenciales documentadas eran erróneas en DOS lados** ([[source-claude-md]] y [[overview]] y [[keycloak]]).

Lo que decían los docs: `usuario_prueba` / `1234`.

Lo que pide el backend en realidad:
1. **Email, no username**: `LoginRequest.java` tiene `@Email` sobre el campo `email`. Pasar `usuario_prueba` falla con 400 (`{"validationErrors":{"email":"El formato del email es inválido"}}`) ANTES de llegar a Keycloak.
2. **Password real**: `backend/keycloak-config/realm-export.json:131` define `"value": "Test@1234"`, no `1234`. La password documentada nunca habría pasado la política de Keycloak.

Test empírico contra el gateway local del usuario:
- ❌ `{"email":"usuario_prueba","password":"1234"}` → HTTP 400 (Validation Error).
- ❌ `{"email":"usuario@test.com","password":"1234"}` → HTTP 400 (Keycloak: "Credenciales inválidas").
- ✅ `{"email":"usuario@test.com","password":"Test@1234"}` → HTTP 200 con AuthResponse completo (userId `57ba4e62-...`, accessToken JWT firmado por `myfinances-realm`).

**Actualizado**:
- [[source-claude-md]] (raíz, `CLAUDE.md`): credenciales correctas + nota explicando el motivo del email vs username.
- [[overview]]: idem.
- [[keycloak]]: nota larga con el path al realm-export y referencia a la verificación empírica del día.

**Cómo se descubrió el bug**: el realm-export.json (fuente de verdad de Keycloak al primer boot) define `email: "usuario@test.com"` y `credentials[0].value: "Test@1234"`. Alguien al escribir el CLAUDE.md original anotó el username + un placeholder de password que nunca chequeó contra el realm. La inconsistencia sobrevivió porque los Postman tests usan `{{testEmail}}` / `{{testPassword}}` (variables de entorno), no las credenciales hardcoded del usuario seed.

---

## [2026-05-17] schema | Limpieza deuda muerta Cuaderno · #4 cerrado

Cierre del ítem #4 de la deuda menor abierta tras la migración Cuaderno ([[next-steps-cuaderno-migration]]): borrado de `components/ui/label.tsx` y `components/ui/badge.tsx`.

**Commit**: `39ecdd5 chore(ui): remove unused Badge and Label components` (−63 líneas, 2 archivos borrados).

**Verificación previa**:
- `grep -rn "Label" src/` → cero importadores reales de `ui/label` (los matches eran `monthLabel`, `confirmLabel`, `dayLabel`, etc. — substrings inocentes).
- `grep -rn "Badge" src/` → solo auto-referencias internas del propio `badge.tsx`. Cero `<Badge>` en `features/`.

**Razón**: ambos archivos quedaron huérfanos al cerrar el Paso 4 (las páginas migradas usan `<Input label="...">` embebido en lugar de `<Label>` separado, y nada llegó a usar `<Badge>` con paleta Cuaderno). El alias legacy de variantes shadcn en `badge.tsx` (`default | secondary | destructive | success | warning | outline → ink | sepia | wine | sage | sepia | sepia`) era deuda transitoria sin caller.

**Verificación post**:
- ✅ `npm run build` verde (3.12s).
- ✅ `npm run lint`: 6 errores + 1 warning, baseline sin cambios (todos preexistentes en `router/index.tsx`, `OAuthCallbackPage.tsx`, `TransactionsPage.tsx`).

**Estado de la deuda menor** ([[next-steps-cuaderno-migration]] § Próximo):
- ✅ #4 borrar `label.tsx` + alias legacy de `badge.tsx` — **HECHO**.
- ⚠️ #1 bottom-sheets mobile.
- ⚠️ #2 refactor `toast.tsx` a Radix Toast.
- ⚠️ #3 animaciones del `Dialog`.
- ⚠️ #5 visual review en navegador.
- ⚠️ #6 sparkline real en Inversiones (depende de endpoint backend).
- ⚠️ #7 lint tech-debt (3 router + 2 OAuthCallback + 1 toast export).

**Pendiente operativo no resuelto en esta sesión**: `frontend/index.html` (+ Google Fonts) y `frontend/package-lock.json` (reinstall Node 22) llevan modificados sin commitear desde el Paso 1 (2026-05-16). Mencionado al usuario para decidir el commit. ✅ Resuelto en la entrada siguiente.

---

## [2026-05-17] schema | Commit de leftovers del Paso 1

Cierra el dangling commit del Paso 1 que llevaba colgando desde 2026-05-16.

**Commit**: `e15d9b0 chore: commit Paso 1 leftovers (Google Fonts + Node 22 lockfile)` (+641 / −587, 2 archivos).

- `frontend/index.html`: bloque `<link rel="preconnect">` + `<link>` Google Fonts (Newsreader + Hanken Grotesk + JetBrains Mono, subset "production").
- `frontend/package-lock.json`: reinstall limpio tras pasar a Node 22 vía nvm (357 paquetes, 0 vulnerabilities). El CSS del Paso 1 (`src/index.css` con el bloque `@theme`) ya estaba commiteado como parte de uno de los commits del Paso 2.

Sin riesgo: trabajo ya verificado en su momento, sólo faltaba el commit.

---

## [2026-05-17] schema | Migración Toast a Radix · #2 cerrado

Cierre del ítem #2 de la deuda menor. El `toast.tsx` artesanal (cola + `setTimeout` propios) reemplazado por primitivos de `@radix-ui/react-toast` (ya estaba instalado en `package.json`).

**Commit**: `6309b0e refactor(ui): migrate Toast to Radix primitive` (+66 / −73, 8 archivos).

**Arquitectura**:
- `components/ui/toast.tsx` ahora exporta **solo** `ToastProvider` (componente). Internamente arma `ToastPrimitive.Provider` + `Root` + `Title` + `Close` + `Viewport`. Mantiene el chrome Cuaderno (paper bg, `border-l-4` sage/wine/sepia, serif italic).
- `components/ui/use-toast.ts` (nuevo) tiene el `ToastContext`, el hook `useToast` y el tipo `ToastType`. **Sin JSX exports** → no dispara `react-refresh/only-export-components`.
- API pública intacta: `useToast()` sigue devolviendo `{ toast, success, error, info }`.
- 6 consumers actualizados a `import { useToast } from '@/components/ui/use-toast'` (Profile, Categories, Goals lista+detail, Transactions, Investments).

**Ganancia gratis** (lo que motivó el refactor):
- ARIA roles + viewport con `aria-label="Notificaciones"`.
- Focus management (Escape, F6 entre toasts).
- Hover-pause: el timer se pausa mientras el cursor está encima.
- Swipe-to-dismiss en pantallas táctiles (derecha).
- Sin más `setTimeout` manuales; Radix maneja la duración (`duration={4000}`).

**Limitación conocida**: sin `tailwindcss-animate` ni `@keyframes` propios, los `data-state=open/closed` de Radix no animan — el toast aparece/desaparece sin transición. Cierra el ítem #2 pero el ítem #3 (animaciones del Dialog/Toast) sigue abierto.

**Verificación**:
- ✅ `npm run build` verde (2.93s).
- ✅ `npm run lint`: **5 errores + 1 warning** (baja desde 6+1; el error de `toast.tsx` por exportar `useToast` junto al componente está cerrado).
- Bundle: `confirm-dialog-*.js` 41.11 → 30.38 kB (Radix runtime compartido); `index-*.js` 393.17 → 422.83 kB (Radix Toast core); net +18 kB main bundle. Aceptable por la ganancia de a11y.

---

## [2026-05-17] schema | Split router/index.tsx · #7 parcial

Cierre de los **3 errores** de `react-refresh/only-export-components` del ítem #7 (lint tech-debt). Los componentes `ProtectedRoute`, `PublicRoute` y `Loading` vivían en `router/index.tsx` junto al export no-componente `router`, lo que rompe el HMR. Movidos a su propio archivo.

**Commit**: `3e60e9e refactor(router): split route guards into separate module` (+24 / −20, 2 archivos).

- `router/components.tsx` (nuevo) — `ProtectedRoute`, `PublicRoute`, `Loading`.
- `router/index.tsx` — sólo `router` + lazy imports.
- Aprovechado para retirar `border-blue-600` del `Loading` (legado shadcn) → `border-ink` (Cuaderno). El spinner sigue siendo el `border-b-2` rotativo, solo cambia el color.

**Verificación**:
- ✅ `npm run build` verde (2.91s).
- ✅ `npm run lint`: **2 errores + 1 warning** (baja desde 5+1). Remanente: 2 errores `react-hooks/immutability` en `OAuthCallbackPage.tsx` (la función `handleCallback` declarada en el componente sin `useCallback`, captura `navigate`/`setTokens`/`setUser`/`setError`) + 1 warning `react-hooks/incompatible-library` en `TransactionsPage.tsx:79` (`useForm().watch()` no memoizable, conocido de RHF + React Compiler).

**Estado actualizado de la deuda menor**:
- ✅ #2 refactor `toast.tsx` a Radix — **HECHO**.
- ✅ #4 borrar `label.tsx` + alias legacy de `badge.tsx` — **HECHO**.
- 🟡 #7 lint tech-debt — **parcial**: cerrados los 3 router + el toast.tsx, quedan 2 OAuthCallback + 1 warning RHF.
- ⚠️ #1 bottom-sheets mobile.
- ⚠️ #3 animaciones del `Dialog` (y ahora también del Toast) — requiere `tailwindcss-animate` o `@keyframes` + `--animate-*` en `@theme`.
- ⚠️ #5 visual review en navegador.
- ⚠️ #6 sparkline real en Inversiones (depende de endpoint backend).

**Observación adicional encontrada al leer `OAuthCallbackPage.tsx`**: la página todavía tiene look shadcn azul (`bg-gray-50`, `bg-blue-600`, `bg-red-100`, `text-blue-700`). Quedó fuera del Paso 4 porque no estaba en el canvas. **No es un bug funcional** pero si se hace visual review (#5) va a saltar como discrepancia. Migrarla al chrome Cuaderno cuando se quiera unificar (~20 min de trabajo aislado).

---

## [2026-05-17] review | Bug · sesión se pierde a los ~5 min (refresh snake_case)

Tobías reportó tras redeploy: "me logueo pero el token dura cierto tiempo y se vence y pierdo la sesión, deberíamos usar el refreshtoken o algo".

**Diagnóstico** (no fix): el refresh **ya está implementado** en ambos lados (frontend interceptor + SessionRestorer al boot, backend wrappeando Keycloak `grant_type=refresh_token`, gateway whitelisteando el endpoint). El bug está en `UserService.refreshToken()`: devuelve el `Map<String, Object>` crudo de Keycloak (snake_case) en vez de wrappearlo en un DTO camelCase como sí lo hace `login()`. El frontend lee `data.accessToken` → `undefined` → `setTokens(undefined, undefined)` → `localStorage` guarda el string literal `"undefined"` → sesión rota e irrecuperable hasta nuevo login.

**Documentado en**: [[bug-refresh-token-snake-case]] (analysis page con root cause + 2 opciones de fix + plan de implementación + hardening defensivo opcional).

**Stale descubierto en el camino**: [[source-claude-md]] dice "Gateway whitelist: only `GET /api/v1/users/health`" — falso. El whitelist actual incluye también `register`, `login`, `refresh-token`, `health` y `/actuator/**` (`SecurityConfig.java:35-39`). Actualizar [[source-claude-md]] cuando se haga el fix del refresh.

**Pendiente operativo**: Tobías reportó el bug; el fix queda agendado, no se aplicó en esta sesión. ✅ **Resuelto en la entrada siguiente — mismo día.**

---

## [2026-05-17] schema | Fix · refresh-token wrap en camelCase DTO

Tobías pidió arreglar el bug del refresh ya en la misma sesión. Aplicada la opción A del plan ([[bug-refresh-token-snake-case]] § Fixes).

**Commit**: `c0b2e94 fix(user-service): wrap refresh-token response in camelCase DTO` (+60 / −13, 5 archivos).

**Cambios**:
- `RefreshTokenResponse.java` (nuevo) — DTO espejo de `LoginResponse` pero token-only (`accessToken`, `refreshToken`, `expiresIn`, `tokenType`). Lombok `@Data @Builder`.
- `UserService.refreshToken()` cambia signature a `RefreshTokenResponse` (de `Map<String, Object>`); lee los snake_case del Map de Keycloak (`access_token`, `refresh_token`, `expires_in`) y arma el DTO.
- `UserController.refreshToken()` retorna `ResponseEntity<RefreshTokenResponse>`.
- `UserControllerTest$RefreshToken.refreshToken_Success` actualizado: mock devuelve `RefreshTokenResponse`, assertions en camelCase (`$.accessToken`, `$.refreshToken`, `$.expiresIn`, `$.tokenType`).
- `MyFinances_API.postman_collection.json` — request "Refresh Token" pasa de `json.access_token`/`json.refresh_token` a `json.accessToken`/`json.refreshToken`. El request "Login Keycloak directo" queda en snake_case (correcto — ese va directo a Keycloak `:8082`, que sí responde en OAuth2 standard snake_case).

**Tests JUnit pre-existing broken**: descubierto en el camino. `mvn test` en user-service devuelve 27 tests con "ApplicationContext failure threshold (1) exceeded" — falla EN main también (verificado stash-ando los cambios y corriendo `mvn test -Dtest=UserControllerTest`). No es regresión introducida por este fix. Se documentó como deuda en [[bug-refresh-token-snake-case]] § Estado. Build con `-DskipTests` ✅ verde.

**Build + deploy**:
- `cd backend && ./rebuild.sh user-service` — imagen `user-service:latest` reconstruida en daemon de Minikube.
- `kubectl rollout restart deployment/user-service -n default` + `rollout status` — pod nuevo arrancó (`Started UserServiceApplication in 7.111 seconds`).

**Verificación empírica end-to-end** (con `kubectl port-forward svc/gateway-service 8080:8080`):
1. Login con credenciales reales → 200 + JWT con `expiresIn: 300`.
2. `POST /api/v1/users/refresh-token { refreshToken }` → 200 con `{accessToken, refreshToken, expiresIn: 300, tokenType: "Bearer"}` — **todo camelCase, todo poblado**.

El frontend (que ya está bien) leerá `data.accessToken` correctamente y `setTokens` no guardará más el string `"undefined"`.

**Stale colateral actualizado**: [[source-claude-md]] (CLAUDE.md raíz) — sección "Authentication" ahora lista la whitelist completa del gateway (`OPTIONS /**`, `register`, `login`, `refresh-token`, `health`, `/actuator/**`), no sólo `health`.

**Hardening defensivo del frontend pendiente (no bloqueante)**: ver [[bug-refresh-token-snake-case]] § Hardening — chequeos contra inputs `undefined`/`null` en `setTokens` y contra el literal `"undefined"` en `SessionRestorer` (defensa para usuarios que ya tengan `"undefined"` guardado de antes del fix).

---

## [2026-05-17] schema | OAuthCallback Cuaderno + lint fixes · lint a cero errores

Cierre del ítem OAuthCallback (que estaba doble: visual stale shadcn + 2 errores `react-hooks/immutability`).

**Commit**: `02b5fb2 feat(ui): migrate OAuthCallback to Cuaderno + fix lint errors` (+99 / −80, 1 archivo).

**Visual** — reemplazo del chrome shadcn-blue:
- `bg-gray-50` → `bg-paper`.
- Eyebrow uppercase tracked `Autenticación · Google` (sepia) / `· Error` (wine).
- h1 serif Newsreader 36px con `.` en wine.
- Descripción en serif italic sepia 15px.
- Botón "Volver al inicio" como pill `bg-ink text-paper rounded-pill` (en lugar de `text-blue-600 hover:underline`).
- Spinner `border-b-2 border-ink` (en lugar de `border-blue-600`).
- Removido `import { TrendingUp } from 'lucide-react'` — mandamiento Cuaderno "sin íconos lucide".

**Lint** — dos rounds para cerrarlo:
1. Primer intento: inline `handleCallback` adentro del `useEffect` como función local `run`. Cierra los 2 errores `react-hooks/immutability` del original, pero **destapa una regla más nueva** (`react-hooks/set-state-in-effect`) sobre los `setError(...)` síncronos al validar URL/sessionStorage. Esta regla estaba enmascarada antes por las otras 2 que sobreescribían.
2. Segundo intento: mover la validación síncrona URL/sessionStorage al lazy initializer de `useState` (que sí puede tener side-effect reads al mount sin disparar la regla). El effect queda con sólo: `removeItem` × 2 + el async `run`. El `setAsyncError(...)` en el `catch` de `run` no dispara la regla porque está tras un microtask.

**Hygiene extra**: selectores Zustand individuales (`useAuthStore((s) => s.setTokens)`) en lugar del destructure. Evita re-renders cuando cambia otra parte del store.

**Verificación**:
- ✅ `npm run build` verde (3.43s).
- ✅ `npm run lint`: **0 errores + 1 warning** — primera vez en cero errores desde que empezó la migración Cuaderno. El único warning remanente es el `useForm().watch()` en `TransactionsPage.tsx:79` (React Compiler "Compilation Skipped" — no bloqueante).

**Comportamiento idéntico al original**: la página sigue haciendo el token exchange contra Keycloak, decodea el JWT, llama `socialRegister` + `getProfile`, y navega a `/dashboard` (o muestra error). Token exchange sigue leyendo snake_case directo de Keycloak (la página bypassa nuestro `/api/v1/users/refresh-token` que sí devuelve camelCase desde el fix del commit `c0b2e94`).

**Estado final de la deuda menor Cuaderno**:
- ✅ #2 refactor Toast a Radix.
- ✅ #4 borrar Label + alias Badge.
- ✅ #7 lint tech-debt — **0 errores** (3 router + 1 toast + 2 OAuthCallback cerrados).
- ✅ OAuthCallback Cuaderno migration (era nuevo, descubierto en sesión del fix).
- ⚠️ #1 bottom-sheets mobile.
- ⚠️ #3 animaciones del Dialog y Toast (`@keyframes` + `--animate-*` en `@theme`).
- ⚠️ #5 visual review en navegador.
- ⚠️ #6 sparkline real (depende de endpoint backend).
- ⚠️ Warning `useForm().watch()` en `TransactionsPage.tsx:79` — único lint remanente.

---

## [2026-05-17] schema | Hardening defensivo del refresh · localStorage poisoning blindado

Cierre del último ítem que dejaba el bug [[bug-refresh-token-snake-case]] expuesto a recurrencia (y desbloqueo automático para usuarios con localStorage envenenado por el bug histórico).

**Commit**: `df521c5 fix(auth): harden refresh-token plumbing against poisoned localStorage` (+23 / −2, 3 archivos).

**Tres chequeos defensivos**:
1. `frontend/src/stores/authStore.ts` — `setTokens` ahora bailea con `console.error` si `accessToken` o `refreshToken` vienen `undefined`/`null`/empty antes de tocar localStorage. La causa raíz del bug histórico era exactamente esto: `localStorage.setItem('refreshToken', undefined)` coerciona a el string literal `"undefined"`.
2. `frontend/src/App.tsx` — `SessionRestorer` trata los strings literales `"undefined"` y `"null"` en localStorage como ausentes, y los **self-healea con `removeItem`**. Consecuencia: usuarios que aún tengan localStorage envenenado del bug histórico **no necesitan limpiar a mano** — el siguiente boot de la app los limpia automáticamente y los manda a `/login`.
3. `frontend/src/api/client.ts` — interceptor 401 aplica el mismo chequeo antes de mandar a Keycloak. Ahorra el roundtrip a Keycloak para rechazar un token literal `"undefined"`.

**Sin cambios de comportamiento para sesiones sanas** — pura resiliencia.

**Verificación**:
- ✅ `npm run build` verde (3.43s).
- ✅ `npm run lint`: 0 errores + 1 warning (sin cambios — el warning RHF sigue).

**Impacto para Tobías**: el aviso que te di antes ("borrá la entrada `refreshToken` de DevTools si abriste la app antes del fix") ya no aplica — la próxima vez que abras la app, `SessionRestorer` detecta el `"undefined"` y lo limpia solo. Solo necesitás un login fresh.

**Esto cierra TODOS los items abiertos del bug [[bug-refresh-token-snake-case]]**.

---

## [2026-05-17] schema | useForm().watch() → useWatch · lint a CERO

Cierre del último warning de lint (`react-hooks/incompatible-library` en `TransactionsPage.tsx:79`).

**Commit**: `54a6e18 refactor(transactions): swap useForm().watch() for useWatch` (+5 / −3, 1 archivo).

**Cambio**:
- Import: agregar `useWatch` junto a `useForm`.
- Destructure de `useForm()`: reemplazar `watch` por `control`.
- `const selectedType = watch('type')` → `const selectedType = useWatch({ control, name: 'type' })`.

**Razón**: la función `watch()` que devuelve `useForm()` no es memoizable porque captura los valores más recientes vía closure. React Compiler skipea memoización de la página completa por eso. `useWatch` es la misma suscripción pero con interface memoizable. Default value sale del form's `defaultValues` (`{ type: 'EXPENSE' }`), así que el primer render se comporta idéntico.

**Verificación**:
- ✅ `npm run build` verde (3.50s).
- ✅ `npm run lint`: **0 errores + 0 warnings** — clean por primera vez desde que empezó la migración Cuaderno (Paso 1 estaba con 13+5, baseline post-Paso 7 estaba con 6+1).

**Estado del lint en hito**: el frontend está completamente clean. Cualquier nuevo error/warning que aparezca de ahora en más es regresión introducida y debería bloquearse.

---

## [2026-05-17] schema | Animaciones Dialog + Toast · ítem #3 cerrado

Cierre del ítem #3 de la deuda menor — los overlays Dialog y Toast estaban montando/desmontando sin transición desde que se crearon (Paso 6).

**Commit**: `81768e8 feat(ui): add open/close animations to Dialog and Toast overlays` (+61, 3 archivos).

**Mecanismo**: Tailwind v4 expone cada `--animate-{name}` del `@theme` como utility `animate-{name}` automáticamente. Definí 6 tokens en `@theme` + 6 `@keyframes` al final del `index.css` (fuera de `@layer base` porque `@keyframes` no se anida limpiamente en layers).

**Tokens agregados al `@theme`**:
- `--animate-cuaderno-overlay-in: cuaderno-overlay-in 150ms ease-out`
- `--animate-cuaderno-overlay-out: cuaderno-overlay-out 100ms ease-out forwards`
- `--animate-cuaderno-content-in: cuaderno-content-in 200ms cubic-bezier(0.16, 1, 0.3, 1)`
- `--animate-cuaderno-content-out: cuaderno-content-out 150ms cubic-bezier(0.4, 0, 0.6, 1) forwards`
- `--animate-cuaderno-toast-in: cuaderno-toast-in 220ms cubic-bezier(0.16, 1, 0.3, 1)`
- `--animate-cuaderno-toast-out: cuaderno-toast-out 150ms ease-in forwards`

**Diseño de las animaciones** (calmas, no bouncy — fiel al espíritu Cuaderno):
- **Overlay**: fade puro 150/100ms.
- **Dialog Content**: fade + 2% slide vertical + zoom 0.97→1, 200ms con cubic-bezier que da un overshoot mínimo. Salida sin overshoot.
- **Toast**: slide-in lateral desde la derecha (la viewport está bottom-right). Salida fade + slide 2rem.

**Detalle técnico crítico — `forwards` en las salidas**: sin `animation-fill-mode: forwards`, después de que termina el keyframe `out` el elemento snap-back al estado inicial (opacity 1, posición original) por un frame antes de que Radix lo desmonte → flash visual. Con `forwards`, el elemento queda en el último frame hasta la desmount.

**Detalle técnico crítico — centerización del Dialog**: el Dialog Content tiene utilidades `-translate-x-1/2 -translate-y-1/2` para centrarse. Las keyframes `cuaderno-content-in/out` incluyen `translate(-50%, -50%)` en su frame final → el snap-back tras la animación coincide exactamente con la posición de las utilidades → invisible.

**Toast: convivencia con swipe**: las clases existentes `data-[swipe=move]:translate-x-[...]`, `data-[swipe=cancel]:translate-x-0`, `data-[swipe=end]:translate-x-[...]` quedan intactas. Las `data-[state=open/closed]` solo aplican durante mount/unmount; los `data-[swipe=...]` solo durante gesture del user. No se pisan.

**Verificación**:
- ✅ `npm run build` verde (3.52s).
- ✅ `npm run lint`: 0 errores + 0 warnings (sin cambios).
- ✅ `grep` en `dist/assets/*.css` confirma los 6 `@keyframes` y las 6 utilidades `animate-cuaderno-*` están compiladas.

**Estado final de la deuda menor Cuaderno**:
- ✅ #2 Toast Radix · ✅ #3 animaciones · ✅ #4 dead code · ✅ #7 lint · ✅ OAuthCallback · ✅ hardening refresh · ✅ warning RHF.
- ⚠️ #1 bottom-sheets mobile (necesita test viewport mobile).
- ⚠️ #5 visual review (Tobías necesita levantar `npm run dev`).
- ⚠️ #6 sparkline real Inversiones (bloqueado por endpoint backend que no existe).

Lo que queda no es "deuda" en sentido estricto — son trabajos que requieren un input externo (mobile testing, ojo humano en browser, endpoint nuevo).

---

## [2026-05-17] ingest | Wishlist de features futuras + cierre de sesión

Cierre de la jornada del 2026-05-17. Tobías planteó tres ideas grandes que quedan anotadas como wishlist (no comprometidas en roadmap todavía).

**Creado**: [[future-features-wishlist]] — analysis page con los 3 items, sus motivaciones, bocetos de arquitectura, dependencias y orden de ataque sugerido.

1. **Mostrar el neto** en alguna parte visible. Disparado por: Tobías cargó una transacción positiva y una negativa y "en ningún lado vio el neto". Sospecha mía: el neto del día existe en `TransactionsPage` (Paso 4, commit `f62b90e`) pero podría estar tipográficamente perdido o falta el neto del mes en Dashboard. Esfuerzo chico. Combinable con visual review (#5).
2. **Gastos recurrentes con confirmación mensual + ajuste por inflación AR**. Modelo `RecurringTransaction` (incluye ingresos como sueldo), endpoint `getPending`, pantalla de confirmación con montos editables. Pull-based al login simplifica (no hace falta scheduler). Esfuerzo medio-grande.
3. **Carga por audio con IA (web + a futuro WhatsApp)**. STT (Whisper) + LLM (Claude API con prompt caching) → JSON de transacciones → preview en Dialog → confirmación. WhatsApp requiere webhook público → necesita AWS deploy primero. Esfuerzo muy grande. **Dependencia de #2** (sistema usable día a día primero).

**Stale de [[source-claude-md]] actualizado en CLAUDE.md raíz**:
- "Frontend mid-migration" → "migration complete".
- "Step 1 ... has been applied" → resumen real del estado: 7 pasos + cleanup, lint 0/0, mención a `next-steps-cuaderno-migration` como fuente de items pendientes.

**Snapshot final de la jornada**:
- **10 commits** locales sin pushear (todos `chore`/`refactor`/`fix`/`feat`/`docs` con prefijo claro).
- **Frontend**: migración Cuaderno cerrada · lint 0+0 (primera vez) · animaciones Dialog/Toast funcionando · OAuthCallback migrado · dead code limpio · Radix Toast en lugar del artesanal · hardening del refresh.
- **Backend**: bug crítico del refresh token fixeado y deployado en Minikube + verificado empíricamente · CLAUDE.md whitelist gateway corregida.
- **Vault**: 1 analysis nueva (wishlist) · 1 analysis cerrada como superseded (bug refresh) · `next-steps-cuaderno-migration` actualizada con todos los items completados.

**Pendiente operativo trivial**: 27 commits ahead de `origin/main` (los 19 de la migración del 2026-05-16 + 10 de esta sesión). `git push` cuando Tobías quiera.

**Lo que queda del frontend** (todo requiere input externo):
- Bottom-sheets mobile · visual review · sparkline real (depende de endpoint backend).
- Y los 3 items de [[future-features-wishlist]] cuando Tobías quiera atacarlos.

**Lo que queda del backend**:
- Activar Google OAuth + SMTP real ([[source-notas-google-smtp]] tiene el run-book).
- Investigar los JUnit del user-service que están rotos pre-existing (ver [[bug-refresh-token-snake-case]] § Estado).
- Ingerir al vault los items pendientes del bootstrap: `postman/MyFinances_API.postman_collection.json`, `docker-compose.yml`, `k8s/`, `GoalAutoContributionScheduler.java`. No bloquean trabajo.

---

## [2026-06-02] schema | Push origin + scaffold Fase 0+1 de carga por WhatsApp/IA

Sesión doble: (1) push de los 30 commits pendientes a `origin/main`, (2) arranque de la feature de carga de transacciones por audio/WhatsApp con IA ([[future-features-wishlist]] #3).

**Push**: `291c1db..f45eaa1` empujado a `origin/main` (token PAT provisto por el usuario en el chat — se le avisó de rotarlo por exposición). `Vault-Myfinance/` y `frontend/design_handoff_my_finances/` siguen sin trackear (decisión del usuario si subirlos).

**Diseño fijado con el usuario** (ver [[whatsapp-audio-intake]] para la tabla completa): orquestación híbrida n8n + microservicio · WhatsApp Business Cloud API (Meta) · STT con ElevenLabs · parsing con Claude API (Haiku 4.5, structured outputs) · verificación de teléfono por código WhatsApp · microservicio aislado `intake-service:8086`.

**Aclaración clave al usuario**: Claude Pro ≠ Claude API. El microservicio necesita cuenta de API de Anthropic (console.anthropic.com), facturación aparte.

**Fase 0 — user-service** (compila, exit 0):
- `User` + campos `phone` (unique), `phoneVerified`, `phoneVerificationCode`, `phoneVerificationExpiresAt`.
- `UserRepository.findByPhoneAndPhoneVerifiedTrue` / `findByPhone`.
- `UserService.requestPhoneVerification` (genera código 6 dígitos, TTL 10 min, lo loguea — Fase 3 lo manda por WhatsApp), `confirmPhoneVerification`, `findUserIdByPhone`.
- `UserController`: `POST /api/v1/users/phone/verify`, `/phone/confirm`, `GET /api/v1/users/by-phone/{phone}` (interno, no pasa por gateway).
- DTOs `PhoneVerificationRequestDTO/ConfirmDTO/PhoneLookupResponseDTO`; `phone`/`phoneVerified` en `UserProfileResponseDTO`. Handler `IllegalArgumentException`→400 agregado al `GlobalExceptionHandler`.

**Fase 1 — intake-service** (nuevo módulo, BUILD SUCCESS):
- Puerto 8086. `POST /api/v1/intake/text {phone, text}` (sirve para nueva tx Y confirmación). Máquina de estados conversacional con `PendingConfirmationStore` en memoria (TTL 10 min).
- `ClaudeParsingService` usa el SDK `com.anthropic:anthropic-java:2.34.0` con structured outputs (`record ParsedTransaction` → schema) + cache_control en el system prompt (no cachea en Haiku por el mínimo de 4096 tokens, comentado).
- Feign a user-service (phone→userId) y account-service (listar categorías + crear tx con `X-User-Id`). Resolución nombre→id de categoría (exacto → contiene → mismo tipo → primera).
- `k8s/intake-service.yaml` + `k8s/intake-secrets.yaml` (placeholder API key). Agregado a `rebuild.sh` y `deploy-k8s.sh`.

**Verificación**: ambos servicios `mvn clean compile` verde. NO se construyeron imágenes, NO se deployó, NO hay prueba end-to-end todavía. Sin tests JUnit en intake-service (los de user-service están rotos pre-existing).

**Próximo**: Fase 2 (endpoint `/intake/audio` + ElevenLabs) y Fase 3 (flujo n8n + webhook Meta + envío del código por WhatsApp). Acciones del usuario: rotar el PAT de GitHub, crear cuenta de API de Anthropic + key. Ver [[whatsapp-audio-intake]].

---

## [2026-06-02] review | Testeo e2e Fase 0+1 en Minikube + commits

Tobías deployó en Minikube y testeamos todo lo del scaffold antes de commitear. **Todo verde end-to-end.**

**Casos probados** (contra el cluster vivo): verificación de teléfono (verify→confirm→by-phone) · parseo de gasto ("gasté 4500 en el súper" → EXPENSE $4500 cat Supermercado) · parseo de ingreso ("cobré 200 mil de sueldo" → INCOME $200.000 cat Salario, interpretó "200 mil"=200000) · confirmación "OK"→tx id=1 creada en account-service · ramas NOT_LINKED, NOT_UNDERSTOOD y cancelación ("no" no crea nada).

**Dos bugs encontrados y arreglados en el test** (redeployados y reverificados):
1. **user-service**: `phoneVerified` se guardaba `null` (Lombok `@Builder` ignora el inicializador `= false`) → violaba NOT NULL al sincronizar el usuario en login. Fix: `@Builder.Default`. Síntoma inicial: login devolvía 500 / `userId: null`.
2. **intake-service**: el circuit breaker de Feign envolvía el 404 "teléfono no vinculado" como 500 "No fallback available", tapando el `FeignException.NotFound` que mapea a NOT_LINKED. Fix: `spring.cloud.openfeign.circuitbreaker.enabled=false` (no había fallbacks; el try/catch ya da resiliencia).

**Falso positivo aclarado**: un 401 `invalid x-api-key` inicial NO era por el key (el key es válido — curl directo a Anthropic OK, y el sha256 del secret coincide con el key real); fue timing del pod/secret. Tras el redeploy del fix #2, el pod tomó el key correcto y el parseo anduvo.

**Commits** (rama `feat/whatsapp-ai-intake`, sin pushear todavía):
- `9a08d72 feat(user-service): add WhatsApp phone verification for transaction intake`
- `edfb183 feat(intake-service): natural-language transaction intake via WhatsApp + Claude`

**Notas operativas**: git no tenía identidad en la máquina (se configuró local `tobiasceruttigothe`). El usuario **pegó su API key de Anthropic en el chat** (como antes el PAT) → avisado de rotarla. `Vault-Myfinance/` sigue sin trackear (los cambios del vault son locales).

**Pendiente**: decidir cómo aterrizar la rama (merge a main / PR). Luego Fase 2 y 3.

---

## [2026-06-02] schema | Fase 2 (ElevenLabs STT) + Fase 3 (notifier + runbook)

Tras mergear Fase 0+1 a main, Tobías pidió avanzar Fase 2 y 3 aunque todavía no tiene número de WhatsApp ni cuenta Meta Business (las testeará cuando las consiga). Código escrito y compilando; **sin testear ni commitear** todavía.

**Fase 2 — STT ElevenLabs** (intake-service):
- `ElevenLabsSttService`: Spring `RestClient` multipart a `POST /v1/speech-to-text` (header `xi-api-key`, `model_id=scribe_v1`), parsea `text` de la respuesta.
- `IntakeController.POST /api/v1/intake/audio` (multipart: `phone` + `file`) → transcribe → mismo `intakeService.handle(phone, text)`. Si el STT falla → reply ERROR amable.
- Config `elevenlabs.*` en application.properties; env `ELEVENLABS_API_KEY` (Secret) + `ELEVENLABS_MODEL` en el manifiesto; `elevenlabs-api-key` agregado a `intake-secrets.yaml`.
- **Testeable ya** con la key de ElevenLabs (que Tobías tiene) + un audio, sin Meta: `curl -F phone=+549... -F file=@gasto.ogg localhost:8086/api/v1/intake/audio`.

**Fase 3 — código + runbook**:
- `WhatsAppNotifier` (user-service): manda el código de verificación vía un webhook de n8n configurable (`NOTIFICATIONS_WHATSAPP_WEBHOOK_URL`). No-op si está vacío (el código se sigue logueando). Cableado en `requestPhoneVerification`. Mantiene las credenciales de Meta solo en n8n.
- `backend/intake-service/README-whatsapp-n8n.md`: runbook completo — arquitectura, env/secrets, setup Meta (app Business, phone number ID, token permanente, webhook verify + HMAC, template de auth para el código), flujos n8n A (inbound text/audio → intake → reply) y B (outbound código), cómo probar sin Meta, y los contratos exactos del intake-service.

**Verificación**: `mvn clean compile` verde en intake-service y user-service. Warnings `@Builder.Default` son pre-existentes en otros campos (no de este cambio).

**Pendiente**: testear Fase 2 con la key de ElevenLabs; luego commitear. Fase 3 (n8n + Meta) cuando Tobías tenga número + cuenta Meta Business. Rotar credenciales expuestas (PAT GitHub + key Anthropic).

---

## [2026-06-07] review | WhatsApp inbound end-to-end VIVO (Fase 2 + Fase 3 inbound)

Sesión grande: se probó Fase 2 (audio), se montó toda la cadena WhatsApp real y
**funcionó end-to-end** — voz y texto por WhatsApp → IA → confirmación → transacción.
Detalle completo en [[whatsapp-audio-intake]]; plan de infra futura en [[deployment-infra-plan]].

**Fase 2 (audio) — probada y commiteada**:
- Bug de deploy encontrado: `kubectl rollout restart` reusa el spec viejo del Deployment;
  el env `ELEVENLABS_API_KEY` nunca se había aplicado al cluster. Hubo que `kubectl apply -f
  intake-service.yaml`. (Lección para AWS: el CI/CD debe hacer `apply`, no `restart`.)
- La imagen del pod era de Fase 1 (sin endpoint `/audio`) → `rebuild.sh intake-service` + apply.
- Test self-contained: generé el audio con la **TTS** de ElevenLabs ("gasté 4500 en el súper"),
  se lo mandé al `/intake/audio` (STT Scribe) → parseó → NEEDS_CONFIRMATION → "OK" → tx creada.
- Commit `68f9479 feat(intake-service): audio intake via ElevenLabs Scribe STT (Fase 2)`.

**Meta WhatsApp (modo prueba)**:
- App `My-finances` (Business, modo prueba). El **UI nuevo de Meta es por casos de uso**
  ("Conectarse con los clientes a través de WhatsApp"), no por "agregar producto" — la doc
  vieja del runbook estaba desactualizada en eso (corregido).
- Datos: bot `+1 555 677 3028`, **Phone Number ID `1092667377270926`**, **WABA `1483218953101834`**,
  token **temporal 24 h**, destinatario de prueba = número personal de Tobías.

**n8n + cloudflared en el cluster**:
- `k8s/n8n.yaml` (n8nio/n8n, PVC SQLite, `N8N_ENCRYPTION_KEY` en `n8n-secrets`) +
  `k8s/cloudflared.yaml` (Quick Tunnel → URL `*.trycloudflare.com` efímera).
- Workflow **importado por la API de n8n** (no a mano en la UI) → patrón infra-as-code que
  pidió Tobías. Token de Meta guardado en una **credencial httpHeaderAuth** (no en el JSON).
  El schema de la credencial pidió `allowedHttpRequestDomains:"all"`.
- Workflow A (`whatsapp-inbound.json`): webhook GET (eco `hub.challenge`) + POST (mensajes)
  → `Extract` (normaliza teléfono) → `Is Audio?` → text/audio → intake-service → reply por Graph API.

**Bug Argentina del "9" (resuelto)**: WhatsApp manda el `from` **con** 9 (`5493516421422`),
pero la Cloud API solo acepta **enviar** al número **sin** 9 (`543516421422`); si no, falla con
`(#131030) Recipient phone number not in allowed list`. El nodo `Extract` ahora hace
`from.replace(/^549/, '54')` y ese formato (`+543516421422`) es el que se verifica en user-service.
Se descubrió mirando las ejecuciones de n8n por API (la primera real dio NOT_LINKED + #131030).

**Verificación e2e (WhatsApp real de Tobías)**: "Gasté 4500 en el súper" (texto) y un audio →
ambos parseados, confirmados con "OK", y persistidos. Chequeado en account-service:
tx id=2 ($4500), id=3 ($9000) EXPENSE Supermercado (+ id=1 del test de audio). Balance −$18.000, 3 egresos.

**Commits de la sesión** (en `main`, sin pushear — 35 ahead de origin):
- `68f9479` Fase 2 audio · `96d4f58` n8n inbound pipeline · `82141f7` WhatsAppNotifier (Fase 3 outbound, **sin desplegar ni probar**).

**Cosas a definir / pendientes**:
- **Workflow B** (mandar el código de verificación por WhatsApp) — sin armar. Hoy el código se
  lee de los logs de user-service. El `WhatsAppNotifier` está codeado/commiteado pero la imagen
  desplegada de user-service es la vieja (no lo incluye).
- **Token permanente de Meta** (System User) — el temporal vence en 24 h.
- **HMAC `X-Hub-Signature-256`** del webhook — no se valida (webhook público). Hardening pendiente.
- **Efímero**: la URL de cloudflared cambia al reiniciar → re-pegar el Callback en Meta. Se
  resuelve con Named Tunnel + dominio propio ([[deployment-infra-plan]]).
- **Datos de test**: 3 transacciones de prueba quedaron en la cuenta `usuario@test.com`.
- **Deuda histórica**: `backend/user-service/target/` está trackeado (ensucia `git status`); falta
  un `.gitignore` para `target/`. JUnit de user-service siguen rotos pre-existing.

**Infra futura** (pedido de Tobías, documentado en [[deployment-infra-plan]]): dominio gratuito
**`myfinances.qzz.io`** ya registrado en Cloudflare; plan de usar una **notebook vieja con Ubuntu
Server** como servidor casero (k3s + Cloudflare Named Tunnel a un subdominio estable), camino
intermedio antes de AWS.

**Cierre de sesión**: `git push` hecho (`edfb183..82141f7`, 35 commits a `origin/main`).
**Minikube apagado** (`minikube stop`) — no se prueba más por ahora. Runbook para retomar:
[[whatsapp-resume-runbook]]. Roadmap de continuación acordado (en [[whatsapp-audio-intake]]
§ Roadmap): 1) Workflow B (código por WhatsApp) · 2) token permanente Meta · 3) test de cero
(usuario nuevo → número → validaciones → transacciones) · 4) seguridad pendiente (HMAC, rotar
credenciales) · 5) server casero + dominio (k3s, git, SSH, Named Tunnel a `myfinances.qzz.io`).

## [2026-06-09] review | Análisis 360 + cambio de objetivo: VPS con k3s (chau AWS)

Auditoría completa del proyecto pedida por Tobías, con fixes aplicados en la misma sesión.
Detalle en [[analisis-360-2026-06-09]]; decisión de infra en [[decision-vps-en-vez-de-aws]].

**Cambio de objetivo**: el destino de producción pasa de AWS a un **VPS común con k3s** +
`myfinances.qzz.io` (Cloudflare). Actualizados CLAUDE.md (§ Project Goal), [[overview]],
[[deployment-infra-plan]] y creado el ADR.

**Fixes aplicados (código + k8s, sin commitear aún)**:
- Gateway: **spoofing de `X-User-Id`** cerrado (`headers.set()` pisa el header del cliente;
  en rutas públicas se elimina). Compila OK. `JwtAuthenticationFilter.java`.
- Gateway: CORS configurable vía `CORS_ALLOWED_ORIGINS` (antes hardcodeado localhost).
- k8s: **PVCs para postgres-db y keycloak-db** (antes los datos se perdían al recrear el pod),
  `strategy: Recreate`, `PGDATA` en subdir, probes `pg_isready`.
- k8s: readiness/liveness (`/actuator/health`) + requests/limits en los 7 servicios.
- `.gitignore` raíz creado; `backend/user-service/target/` destrackeado (39 archivos, staged).

**Backlog priorizado** (P0 seguridad → P3 features) en [[analisis-360-2026-06-09]]. Lo más
urgente: credenciales hardcodeadas en manifiestos, Keycloak en `start-dev`, HMAC de Meta,
`/actuator/**` público, `by-phone` accesible a cualquier JWT, y **versionar el vault** (hoy
fuera de git).

## [2026-06-09] schema | Identidad "Fini" + UX: vínculo WhatsApp en la UI

Segunda parte de la sesión del análisis 360. Pedido de Tobías: el diseño Cuaderno quedó
"demasiado profesional y elegante" — quería algo divertido con un personaje. Nace **Fini,
el chanchito alcancía** (My-FINances → Fini). ADR: [[decision-identidad-fini]]
(supersede [[decision-identidad-cuaderno]]).

**Retheme completo sin tocar la arquitectura**: mismos nombres de tokens, valores nuevos en
`@theme` (crema/rosa/coral, Baloo 2 + Nunito, radios grandes); scope tinta → violeta noche;
`chart-colors.ts` re-sincronizado. Mascota en SVG puro con moods (`Fini.tsx` + `FiniSays`).
Verificado con screenshots (login/register) — lint 0+0, build verde.

**UX/funcionalidad**:
- **Vínculo WhatsApp por fin tiene UI**: sección en Perfil (pedir código → confirmar) contra
  `/phone/verify` + `/phone/confirm`, y banner en el Dashboard cuando el teléfono no está
  verificado. Antes el alta de teléfono solo se podía hacer por curl/logs.
- Dashboard: Fini reacciona al mes (festeja ahorro ≥20 %, se preocupa con balance negativo,
  duerme sin datos) con un insight en texto; barras de categorías con color (antes todas ink);
  empty states con globos de Fini.
- `formatCurrency`/`formatDate` pasan de `en-US` a **`es-AR`** ($ 1.234,56).
- Tipos `UserProfile` ahora exponen `phone`/`phoneVerified` (el DTO del backend ya los traía).

Pendiente de probar en vivo cuando se levante Minikube: el flujo completo de verificación
(el código hoy se lee de los logs de user-service hasta que exista el Workflow B de n8n).

## [2026-06-09] schema | Named Tunnel VIVO: wa.myfinances.qzz.io → n8n (URL fija)

Cerrada la pieza #5 del roadmap WhatsApp (URL estable). El Quick Tunnel efímero
(`*.trycloudflare.com`) se reemplazó por un **Cloudflare Named Tunnel** con dominio propio.

- **`k8s/cloudflared.yaml`** reescrito: de `tunnel --url http://n8n:5678` a `tunnel run --token
  $(TUNNEL_TOKEN)`; token en Secret `cloudflared-token` (no versionado; template en
  `k8s/cloudflared-secret.yaml` con placeholder). + resources.
- Tunnel `myfinances` creado en Cloudflare Zero Trust por Tobías; Public Hostname (ahora UI
  "Rutas") `wa.myfinances.qzz.io` → `http://n8n:5678`. DNS CNAME → `<tunnelid>.cfargotunnel.com`
  y HTTPS los crea Cloudflare. Connector HEALTHY, 4 conexiones (edge eze, Buenos Aires).
- **Verificado**: `GET https://wa.myfinances.qzz.io/` → 200; `GET /webhook/whatsapp?hub.challenge=…`
  → eco del challenge + 200 (Workflow A activo respondiendo la verificación de Meta).
- El Callback de Meta pasa a `https://wa.myfinances.qzz.io/webhook/whatsapp` y **deja de cambiar**
  en cada reinicio. Falta re-pegarlo en Meta (apunta a la URL vieja efímera).

Nota seguridad: el webhook ecoó el challenge con un `hub.verify_token` cualquiera → revisar que
el Workflow A valide el verify_token (junto al HMAC pendiente). Token del tunnel quedó pegado en
chat → lista de rotación (Refresh token en el dashboard si se quiere cortar).

Pendiente WhatsApp "definitivo" (checklist en [[whatsapp-audio-intake]]): número real en la WABA,
app a modo Live, token permanente Meta, Workflow B + env en user-service + template Authentication.

## [2026-06-09] schema | Hardening Workflow A: verify token + HMAC (preparado, falta re-importar)

Workflow A endurecido en `n8n/workflows/whatsapp-inbound.json` (13 nodos, era 10):
- **GET**: nodo `Verify Token OK?` (IF) valida `hub.verify_token` contra `$env.META_VERIFY_TOKEN`
  → `Respond Challenge` (OK) / `Respond Forbidden` 403. Antes ecoaba el challenge a cualquiera.
- **POST**: webhook con `rawBody: true` → nodo `Verify Signature` valida el HMAC
  `X-Hub-Signature-256` con `$env.META_APP_SECRET` (timingSafeEqual, fail-closed). Si el secret
  no está seteado, fail-open con warning (no rompe el inbound mientras se configura).
- `k8s/n8n-meta-secrets.yaml` (template) + env `META_VERIFY_TOKEN`/`META_APP_SECRET` (optional)
  en `k8s/n8n.yaml`. `WEBHOOK_URL` actualizado a `https://wa.myfinances.qzz.io/`.

**Aplicado al cluster**: secret `n8n-meta-secrets` con verify token generado
`c3554f3260db6376499466bf8c3ffcb0` (App Secret aún vacío → HMAC en fail-open). n8n reiniciado,
env verificadas en el pod. **El workflow VIEJO sigue activo** hasta re-importar el JSON nuevo.

Pendiente (requiere a Tobías): (1) App Secret de Meta → completar el secret → HMAC fail-closed;
(2) re-importar el workflow a n8n (API key de n8n o UI); (3) actualizar el Verify Token en Meta a
`c3554f3260db6376499466bf8c3ffcb0` y re-verificar; (4) mandar un WhatsApp real para confirmar
inbound + que el HMAC no rechace mensajes legítimos (el rawBody en n8n es sensible a versión).

## [2026-06-09] review | Hardening Workflow A COMPLETO y verificado (re-importado por API)

Cerrado el hardening. Workflow re-importado a n8n por la **API pública** (`PUT /api/v1/workflows/yDuyWoBH6nqIA4LJ` con API key, backup previo en `/tmp/wf-backup.json`), re-activado. Dos candados de n8n descubiertos al probar y resueltos en `k8s/n8n.yaml`:
- `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` — n8n bloquea `$env` en nodos (el IF del verify token y el Code del HMAC lo necesitan). Síntoma: "access to env vars denied".
- `NODE_FUNCTION_ALLOW_BUILTIN=crypto` — n8n bloquea `require('crypto')` en Code nodes. Síntoma: "Module 'crypto' is disallowed". Sin esto el HMAC crasheaba (rechazaba todo por la razón equivocada).

**Verificado end-to-end vía el túnel** (`wa.myfinances.qzz.io`): verify token correcto→challenge / incorrecto→403; HMAC firma válida→procesa hasta Extract / firma inválida→corte limpio (return [], sin crash). La firma se calculó con `openssl dgst -sha256 -hmac <app_secret>` y coincidió con lo que n8n computa del rawBody → confirma que el manejo de rawBody en esta versión de n8n es correcto (era el riesgo que advertí).

App Secret de Meta cargado en el secret `n8n-meta-secrets` (HMAC fail-closed real). Verify token `c3554f3260db6376499466bf8c3ffcb0`.

**Falta de Tobías para cerrar el ciclo**: (1) poner el verify token `c3554...` en el webhook de Meta y re-verificar (antes había puesto "cualquier cosa"; ahora el workflow VALIDA, así que el viejo daría 403); (2) mandar un WhatsApp real (texto+audio) para confirmar que la firma real de Meta valida y el inbound anda. Credenciales nuevas pegadas en chat (App Secret Meta, API key n8n, token Named Tunnel) → lista de rotación.

## [2026-06-09] review | 🎉 WhatsApp inbound VIVO con NÚMERO REAL + hardening probado con firma real de Meta

Hito: mensaje real ("Hola") desde un teléfono externo → número real **Fini +54 9 351 315 8241**
→ circuito completo SUCCESS (ej 30 en n8n): `Webhook → Verify Signature (HMAC firma REAL de Meta ✓)
→ Extract → Intake Text → Meta Send Reply`. El usuario recibió la respuesta NOT_LINKED por WhatsApp.

Confirma de una: Named Tunnel (URL fija), verify token, **HMAC con el rawBody real de Meta**
(el riesgo que advertí — descartado), número real registrado en la WABA, y token de acceso nuevo
enviando. Los status callbacks (delivery/read) terminan en Extract (ignorados), correcto.

**Datos del número real** (reemplazan el de prueba): número `+54 9 351 315 8241`, display name
**"Fini"** (VERIFIED), Phone Number ID **`1203470332841891`** (era `1092667377270926`), WABA ID
**`973923875677110`** (era `1483218953101834`), App ID `1872563573439887`. El workflow se actualizó
con el Phone Number ID nuevo y se re-importó (sigue usando la credencial `jSefOGAvbhfHfVQg`, cuyo
token Tobías actualizó por la UI).

⚠️ **Token de acceso actual es TEMPORAL** (verificado con debug_token: vence 2026-06-10 01:00,
type USER, scopes whatsapp_business_messaging+management). Falta el **permanente (System User)** →
actualizar el value de la credencial en n8n (pegarlo directo en la UI, no en el chat).

Siguiente: vincular el teléfono de Tobías a su cuenta para cargar transacciones de verdad. Ojo
**bug AR del 9**: registrar en el perfil como `+543513158241` (SIN el 9), que es como n8n normaliza
el `from`. El código de verificación hoy sale por logs de user-service (Workflow B aún sin armar).

## [2026-06-10] review | 🎉🎉 FEATURE WHATSAPP COMPLETA: gasto cargado por lenguaje natural, e2e real

Hito mayor: Tobías, desde su WhatsApp personal (+543516421422, ya vinculado a `usuario@test.com`),
mandó "Me compré un helado, me costó 5000" al bot Fini → Claude (Haiku 4.5) parseó → Fini pidió
confirmación → "Ok" → **transacción CREADA** y persistida: `2026-06-10 · EXPENSE · $5000 ·
Entretenimiento · Helado` (verificado vía GET /transactions/recent por el gateway). Fini respondió
"✅ Anotado: Gasto $5.000 en Entretenimiento (Helado)." por WhatsApp. Ejecución n8n 39 SUCCESS.

**Problemas resueltos en esta corrida** (todos eran config del cluster, no código):
1. Keycloak sin realm tras reinicio → `relation "realm" does not exist` (faltaba que arrancara
   tras su DB) → rollout restart. **PVCs ya aplicados** → no vuelve a pasar.
2. Verify token / HMAC: candados de n8n `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` + `NODE_FUNCTION_ALLOW_BUILTIN=crypto`.
3. **Secret `intake-secrets` tenía los PLACEHOLDERS** de anthropic-api-key y elevenlabs-api-key
   (alguna `kubectl apply` del template los pisó). Síntoma: `401 invalid x-api-key` de Anthropic →
   intake devolvía status ERROR. Cargadas ambas keys reales (validadas antes: Anthropic 200; la de
   ElevenLabs tiene scope STT aunque no user_read). **Lección: nunca aplicar los `*-secrets.yaml`
   template; cargar con `kubectl create secret` fuera de git.**
4. `Meta Send Reply` falló con "DNS server returned an error" (Node eligió IPv6, Minikube sin ruta
   IPv6 saliente) → `NODE_OPTIONS=--dns-result-order=ipv4first` en n8n.

**Estado WhatsApp**: inbound texto+audio VIVO con número real Fini. Pendiente para "definitivo":
token permanente de Meta (el actual vence 2026-06-10 01:00 — ya pudo haber vencido), Workflow B
(código de verificación por WhatsApp; hoy por logs), app Meta a modo Live. Credenciales a ROTAR
(todas pegadas en chat hoy): token Named Tunnel, App Secret Meta, API key n8n, access token Meta,
ANTHROPIC_API_KEY, ELEVENLABS_API_KEY.
