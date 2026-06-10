---
type: entity
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-claude-md]]
---

# zipkin

Tracing distribuido. Recolecta spans de todos los servicios para visualizar el flujo de un request a través del sistema.

## Datos clave

- **Puerto**: 9411
- **Manifest**: `backend/k8s/zipkin.yaml`
- **Stack en los servicios**: Micrometer + Zipkin exporter

## Cómo se usa

Cada servicio publica spans a Zipkin automáticamente via Micrometer Tracing. Útil para:
- Seguir un request que entra al gateway y se ramifica a 3 servicios.
- Detectar latencias en llamadas Feign.
- Verificar que la propagación de `X-User-Id` y trace IDs funciona end-to-end.

## Conexiones

- Recibe spans de → [[gateway-service]], [[user-service]], [[account-service]], [[investment-service]], [[goals-service]]
