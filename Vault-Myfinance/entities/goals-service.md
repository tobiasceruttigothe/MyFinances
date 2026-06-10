---
type: entity
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-claude-md]], [[source-commit-f0d5dd8]]
---

# goals-service

Metas de ahorro: definir objetivos, registrar contribuciones, calcular progreso. **El más nuevo** de los servicios de dominio (commit `f0d5dd8`, 2026-02-25).

## Datos clave

- **Puerto**: 8085
- **Paquete**: `com.myfinances.goals`
- **Path**: `backend/goals-service/`

## Modelo

- `Goal` — meta de ahorro
- `GoalStatus` (enum) — estado de la meta
- `GoalContribution` — aporte concreto a una meta
- `ContributionType` (enum) — tipo de contribución (manual, automática)

## Componentes

- `GoalService` — CRUD + cálculo de progreso.
- `GoalAutoContributionScheduler` — **scheduler** para contribuciones automáticas. Único servicio con tarea programada hasta ahora ([[concept-scheduling-goals]]).

## DTOs

`GoalResponseDTO`, `CreateGoalDTO`, `UpdateGoalDTO`, `GoalStatisticsDTO`, `ContributionResponseDTO`, `AddContributionDTO`, `AdjustContributionDTO`.

## Feign clients

- `AccountServiceClient` — registra contribuciones como transacciones en [[account-service]] cuando corresponde.

## Conexiones

- Llama a → [[account-service]]
- Scheduler dispara → contribuciones automáticas según frecuencia configurada
