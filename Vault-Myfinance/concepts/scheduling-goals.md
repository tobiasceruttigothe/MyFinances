---
type: concept
status: draft
created: 2026-05-16
updated: 2026-05-16
sources: [[source-claude-md]]
---

# Scheduling (goals-service)

Tarea programada para contribuciones automáticas a metas. Único componente con scheduling hasta ahora.

## Componente

- `backend/goals-service/src/main/java/com/myfinances/goals/scheduler/GoalAutoContributionScheduler.java`

## Qué hace (a verificar al leer el código)

Probablemente:
- Corre periódicamente (cron / fixed-rate Spring `@Scheduled`).
- Busca metas con contribución automática activa.
- Crea contribuciones del monto/frecuencia configurada.
- Posiblemente llama a [[account-service]] vía Feign para registrar la transacción espejo.

> **TODO**: leer el archivo y verificar la implementación real. Esta página está en `draft` hasta confirmar.

## Implicancia operativa

Si goals-service tiene **N replicas**, el scheduler corre en cada una → duplicaría contribuciones. Verificar si hay leader election / locking, o si el deployment está hardcoded a 1 replica.
