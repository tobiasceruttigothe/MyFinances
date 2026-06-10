---
type: entity
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-design-handoff-cuaderno]], [[source-handoff-readme]]
---

# frontend

La app web de MyFinances. Único cliente del [[gateway-service]] hasta ahora.

## Datos clave

- **Ubicación**: `frontend/`
- **Stack**: React 19.2 + TypeScript 5.9 + Vite 7.3 + Tailwind CSS v4.2 (ver [[concept-frontend-stack]] para el detalle completo).
- **Identidad visual**: sistema **"Cuaderno"** (en migración desde el shadcn default azul). Ver [[concept-sistema-cuaderno]] y [[decision-identidad-cuaderno]].

## Estructura de `src/`

```
frontend/src/
├── api/            ← hooks de TanStack Query y mutations (talks to gateway)
├── App.tsx
├── components/
│   ├── shared/     ← AppLayout, navegación, layouts reutilizables
│   └── ui/         ← primitivas (button, input, card, badge, toast, skeleton, label)
├── features/       ← una carpeta por feature (dashboard, transactions, etc.)
├── index.css       ← tokens CSS (Tailwind v4 @theme)
├── lib/            ← utils (cn, formatters, pkce.ts para Google OAuth)
├── main.tsx        ← entry point
├── router/         ← React Router 7 setup
├── stores/         ← Zustand stores
└── types/          ← TypeScript types compartidos
```

## Comandos

```bash
cd frontend
npm run dev      # Vite dev server (http://localhost:5173 por defecto)
npm run build    # tsc -b && vite build
npm run lint     # eslint .
```

## Integración con el backend

- **Único punto de contacto**: [[gateway-service]] (puerto 8080 vía `kubectl port-forward`).
- **Auth**: obtiene JWT directamente de [[keycloak]] (login tradicional) o vía PKCE de Google (pendiente activar — ver [[concept-auth-keycloak]]).
- **Header**: `Authorization: Bearer <jwt>` en cada request.
- **No conoce** a los servicios de dominio por separado. No habla `X-User-Id` (eso lo agrega el gateway en su filtro — ver [[concept-jwt-x-user-id]]).

## Estado al 2026-05-16

- Frontend **completo a nivel de scaffolding** (todas las features con páginas, hooks, stores).
- Identidad visual: **default shadcn (azul)** — se está migrando al sistema [[concept-sistema-cuaderno]].
- Paso 1 del plan de migración Cuaderno **aplicado** (tokens CSS + Google Fonts). Ver [[log]].
- Pasos 2-7 pendientes (componentes base, AppLayout, páginas, Tinta mode, overlays, Recharts).

## Componentes UI ya scaffoldeados

`frontend/src/components/ui/`: `button.tsx`, `input.tsx`, `card.tsx`, `badge.tsx`, `toast.tsx`, `skeleton.tsx`, `label.tsx`. **5 de 6** son los que el handoff manda reescribir en el Paso 2 — la migración es reemplazo, no creación.

## Mocks pendientes (no diseñados en el handoff)

De [[source-handoff-readme]] § 8: estados vacíos, loading skeletons, errores de red, notificaciones in-app, tab "Aportes" de meta, modal de detalle de transacción, command palette ⌘K. Implementar siguiendo el sistema documentado, no inventar lenguaje nuevo.

## Notas

- **No hay `tailwind.config.js`**: Tailwind v4 usa `@theme` en CSS. Los tokens se exponen directo desde `frontend/src/index.css`.
- **Datos de ejemplo en pesos argentinos** (los mockups vienen así). La implementación real usa los hooks de TanStack Query en `frontend/src/api/`.
