---
type: entity
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-claude-md]]
---

# account-service

Núcleo financiero: transacciones (ingresos/egresos), categorías, balance, reportes.

## Datos clave

- **Puerto**: 8081
- **Paquete**: `com.myfinances.account`
- **Path**: `backend/account-service/`

## Modelo

- `TransactionType` (enum) — INCOME, EXPENSE
- `CategoryType` (enum) — tipo de categoría
- `Category` — categoría de transacción
- `Transaction` — movimiento de dinero

## Controllers

- `AccountController` — balance summary, endpoints de cuenta.
- (Inferido) `TransactionController`, `CategoryController` — CRUD.

## Service layer

- `TransactionService` — CRUD de transacciones, cálculo de balance.

## DTOs principales

`TransactionDTO`, `CreateTransactionDTO`, `UpdateTransactionDTO`, `TransactionResponseDTO`, `BalanceDTO`, `MonthlySummaryDTO`, `CategorySummaryDTO`, `CategoryDTO`, `CreateCategoryDTO`, `UpdateCategoryDTO`, `CategoryResponseDTO`.

## Feign clients

- `InvestmentClient` — para consultar inversiones del usuario (probable uso en reports/balance).

## Conexiones

- Recibe llamadas de → [[investment-service]] (crea EXPENSE asociado a la inversión)
- Recibe llamadas de → [[goals-service]] (contribuciones a metas pueden registrarse como transacciones)
- Recibe llamadas de → [[user-service]] (crear categorías default al registrar)
- Llama a → [[investment-service]] (Feign `InvestmentClient`)

## Notas

- Multi-tenant por `X-User-Id` ([[concept-jwt-x-user-id]]); todas las queries filtran por user.
