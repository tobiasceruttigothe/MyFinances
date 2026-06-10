---
type: source
status: stable
created: 2026-05-16
updated: 2026-05-16
---

# Fuente — commit f0d5dd8

**Hash**: `f0d5dd8`
**Fecha**: 2026-02-25
**Mensaje**: _"agrego microservicio de goals y mejoro problemas a la hora de registrar una inversion"_

## Qué introduce

1. **Nuevo servicio**: [[goals-service]] (metas de ahorro, contribuciones, scheduler). Es el último microservicio agregado a la familia.
2. **Fix** en el flujo de registro de inversión en [[investment-service]] (presumiblemente relacionado con la consistencia investment → account-service EXPENSE espejo).

## Páginas que derivan

- [[goals-service]]
- [[investment-service]]
- [[concept-feign-resilience]] (caso del flujo investment → account)
