---
type: decision
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-design-handoff-cuaderno]], [[source-handoff-readme]]
---

# Decisión — Adoptar el sistema visual "Cuaderno"

**Fecha de la decisión**: mayo 2026 (handoff entregado).
**Estado**: aprobada por el usuario. Implementación en progreso (Paso 1 aplicado al 2026-05-16).

## Contexto

El frontend existente (React 19 + Vite 7 + Tailwind v4 + shadcn/ui) arrancó con la paleta **shadcn default**: `--primary` azul corporativo (`#3b82f6`), sistema HSL, `.dark` mode estándar, tipografía system-ui. Funcional pero **indistinguible de cientos de dashboards genéricos** — no tiene personalidad propia.

Alternativas posibles:
- Mantener shadcn default (mínimo esfuerzo, máximo blandness).
- Tweakear colores de shadcn (un poco mejor, pero sigue siendo shadcn).
- Adoptar un sistema con identidad fuerte (más esfuerzo, mucha más personalidad).

## Decisión

Adoptar el sistema visual **"Cuaderno"** — la app como cuaderno personal de cuentas (no dashboard bancario). Documentado en [[source-design-handoff-cuaderno]] y manual de implementación en [[source-design-system-html]]. Pilares en [[concept-sistema-cuaderno]].

## Consecuencias positivas

- **Identidad clara y diferenciada**: paleta cálida tipo papel, tipografía editorial (Newsreader serif), número grande en lugar de gradientes.
- **Decisiones tipográficas con significado**: serif para números importantes (autoridad), mono para fechas (ledger), italic para evaluativos (ROI). No es "más bonito" — es **más legible** para quien lleva las cuentas.
- **Dos paletas con un solo set de componentes**: el switch a Tinta para Inversiones es un wrapper CSS, no código duplicado. Ver [[concept-cuaderno-vs-tinta-mode]].
- **Design system documentado al milímetro**: tokens copiables, mockups ejecutables, tabla de migración archivo-por-archivo. Reduce el ambiguity cost del rediseño.

## Consecuencias / trade-offs

- **La capa visual completa se reescribe**. La lógica (hooks de TanStack Query, mutations, validaciones Zod) se mantiene casi intacta, pero **todos los `features/*/Page.tsx` y todos los `components/ui/*.tsx` se tocan**. Es un trabajo de varias sesiones.
- **Se pierde shadcn off-the-shelf**. Los componentes ya no son "copia-pegá del registry"; cada nuevo componente hay que reescribirlo para el sistema Cuaderno. La velocidad de scaffolding se reduce; la coherencia visual se gana.
- **Requiere disciplina sostenida**. Los "10 mandamientos" de [[concept-sistema-cuaderno]] son irrenunciables. Si en una iteración rápida se agrega un componente con caja completa (input shadcn), o un número en sans, o un emoji en lugar de glifo, el sistema se diluye a dashboard genérico — y la diferencia es invisible hasta que está hecho. Hay que mirar los nuevos componentes con el manual al lado.
- **Tinta mode tiene restricción dura**: todo componente debe consumir variables CSS genéricas (`var(--color-paper)` etc.). Hardcodear colores rompe el switch a Inversiones. Es una regla que hay que recordar.
- **Mockups no cubren todo**. Estados vacíos, loading skeletons, errores de red, command palette ⌘K, etc. no fueron diseñados — hay que **inventar dentro del sistema**, no improvisar lenguaje nuevo (ver [[source-handoff-readme]] § 8).

## Plan de implementación

Definido en 7 pasos por el handoff. Ver [[source-handoff-readme]] § 6 o [[source-design-handoff-cuaderno]] "Estado de implementación".

## Conceptos relacionados

- [[concept-sistema-cuaderno]] — los pilares y los 10 mandamientos.
- [[concept-cuaderno-vs-tinta-mode]] — mecanismo de dos paletas.
- [[concept-frontend-stack]] — el stack sobre el que se aplica.
