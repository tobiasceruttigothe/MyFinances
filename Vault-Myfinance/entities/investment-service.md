---
type: entity
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-claude-md]], [[source-commit-f0d5dd8]]
---

# investment-service

Gestión de inversiones. Caso ejemplo de **inter-service write**: crear una inversión auto-genera una transacción EXPENSE en [[account-service]].

## Datos clave

- **Puerto**: 8083
- **Paquete**: `com.myfinances.investment`
- **Path**: `backend/investment-service/`

## Modelo

- `Investment` — entidad principal
- `InvestmentType` (enum) — tipos de inversión válidos

## Servicios

- `InvestmentService` — CRUD + validación de tipo + creación de EXPENSE asociado
- `UserSettingsService`

## DTOs

`InvestmentDTO`, `CreateInvestmentDTO`, `UpdateInvestmentDTO`, `InvestmentResponseDTO`, `InvestmentSummaryDTO`, `PortfolioSummaryDTO`.

## Feign clients (con fallbacks)

- `AccountServiceClient` — crea la transacción EXPENSE espejo al registrar la inversión.
- `UserServiceClient` + `UserServiceClientFallback` — datos/settings del usuario; degrada elegante si el servicio cae ([[concept-feign-resilience]]).

## Conexiones

- Llama a → [[account-service]] (crear EXPENSE espejo)
- Llama a → [[user-service]] (settings)
- Recibe llamadas de → [[account-service]] (vía `InvestmentClient` para reports)

## Notas

- Commit `f0d5dd8` (2026-02-25): _"agrego microservicio de goals y mejoro problemas a la hora de registrar una inversion"_. Probable arreglo a la consistencia del flujo investment → account.
