---
type: concept
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-claude-md]]
---

# Feign + Resilience4j

Patrón de comunicación inter-servicio en MyFinances.

## El stack

- **Feign**: cliente HTTP declarativo (Spring Cloud OpenFeign). Cada servicio expone interfaces anotadas que generan implementaciones en runtime.
- **Resilience4j**: circuit breakers, retries, fallbacks.

## Ejemplos en el repo

| Cliente | Servicio origen | Servicio destino | Fallback |
|---|---|---|---|
| `AccountServiceClient` | [[investment-service]] | [[account-service]] | (verificar) |
| `UserServiceClient` + `UserServiceClientFallback` | [[investment-service]] | [[user-service]] | sí, explícito |
| `AccountServiceClient` | [[goals-service]] | [[account-service]] | (verificar) |
| `AccountServiceClient` | [[user-service]] | [[account-service]] | (verificar) |
| `InvestmentClient` | [[account-service]] | [[investment-service]] | (verificar) |

## DNS de servicio

Las URLs base apuntan a Kubernetes Services por nombre:
- `http://account-service:8081`
- `http://user-service:8084`
- `http://investment-service:8083`
- `http://goals-service:8085`

Esto reemplaza el rol que cumplía Eureka antes de la migración a K8s ([[decision-chau-eureka-hola-k8s]]).

## Caso ilustrativo

[[investment-service]] crea una inversión → llama a `AccountServiceClient.createTransaction(...)` para registrar un EXPENSE espejo en [[account-service]]. Si account-service no responde:
- Circuit breaker abre tras N fallos consecutivos.
- Fallback (si está implementado) devuelve respuesta degradada en vez de propagar el error.
- La inversión podría quedar **sin transacción espejo** según la política. **(TODO: validar política de consistencia eventual aquí — es un punto de diseño no documentado).**
