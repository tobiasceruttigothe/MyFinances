---
type: concept
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-handoff-readme]]
---

# Stack del frontend

Stack confirmado leyendo `frontend/package.json` (2026-05-16).

## Runtime / build

| Dependencia | Versión | Rol |
|---|---|---|
| React | 19.2 | Framework |
| React DOM | 19.2 | |
| TypeScript | 5.9 (devDep) | |
| Vite | 7.3 (devDep) | Bundler / dev server |
| `@vitejs/plugin-react` | 5.1 (devDep) | |

## Estilos

| Dependencia | Versión | Rol |
|---|---|---|
| `tailwindcss` | 4.2 (devDep) | Utility-first CSS |
| `@tailwindcss/vite` | 4.2 (devDep) | Plugin Tailwind para Vite |

**Notar**: Tailwind v4 **no usa `tailwind.config.js`**. Los tokens se definen vía `@theme {}` directamente en CSS. Ver `frontend/src/index.css`.

## Componentes (shadcn/ui pattern + Radix primitives)

| Dependencia | Rol |
|---|---|
| `@radix-ui/react-avatar` | Avatar primitive |
| `@radix-ui/react-dialog` | Modales |
| `@radix-ui/react-dropdown-menu` | Dropdowns |
| `@radix-ui/react-label` | Form labels accesibles |
| `@radix-ui/react-progress` | Progress bars |
| `@radix-ui/react-select` | Selects |
| `@radix-ui/react-separator` | Separadores |
| `@radix-ui/react-slot` | `asChild` pattern |
| `@radix-ui/react-tabs` | Tabs |
| `@radix-ui/react-toast` | Toasts |
| `class-variance-authority` | Variant API tipo shadcn |
| `clsx` + `tailwind-merge` | `cn()` utility |
| `lucide-react` | Iconos |

## Estado y data

| Dependencia | Versión | Rol |
|---|---|---|
| `@tanstack/react-query` | 5.90 | Server state, cache, mutations |
| `zustand` | 5.0 | Client state local |
| `axios` | 1.13 | HTTP client (probablemente envoltura por TanStack Query) |

## Forms

| Dependencia | Versión | Rol |
|---|---|---|
| `react-hook-form` | 7.71 | Form state |
| `zod` | 4.3 | Schema validation |
| `@hookform/resolvers` | 5.2 | Zod ↔ RHF |

## Routing y gráficos

| Dependencia | Versión | Rol |
|---|---|---|
| `react-router-dom` | 7.13 | Routing |
| `recharts` | 3.7 | Gráficos (ver Paso 7 del plan de migración para cambiar paleta) |

## Lint

- `eslint` 9, `typescript-eslint` 8, `eslint-plugin-react-hooks` 7, `eslint-plugin-react-refresh` 0.4. Config en `frontend/eslint.config.js`.

## Notas relevantes para el sistema Cuaderno

- **`--primary` actual** (en `frontend/src/index.css` antes del Paso 1) es azul shadcn default (`221.2 83.2% 53.3%` en HSL). Tras el Paso 1, todo ese sistema HSL se reemplaza por las variables `--color-*` del sistema Cuaderno.
- **`.dark` selectors** del shadcn original: **no se usan** en Cuaderno. El modo "Tinta" es scope (`data-mode="tinta"`), no global. Ver [[concept-cuaderno-vs-tinta-mode]].
- **`class-variance-authority`** (cva) viene con el patrón shadcn pero el handoff sugiere quitarlo en los componentes reescritos del Paso 2 (`button`, etc.) en favor de variants explícitas más simples. Ver tabla de migración en [[source-design-system-html]].

## Stack no relacionado pero presente

`@types/node`, `@types/react`, `@types/react-dom`, `globals` — devDeps típicas.
