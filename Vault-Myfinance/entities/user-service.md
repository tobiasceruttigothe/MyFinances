---
type: entity
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-claude-md]], [[source-notas-google-smtp]], [[source-commit-291c1db]]
---

# user-service

Servicio de usuarios. Espejo en DB del usuario que vive en [[keycloak]] (la fuente de verdad de identidad).

## Datos clave

- **Puerto**: 8084
- **Paquete**: `com.myfinances.user`
- **Path**: `backend/user-service/`

## Modelo

- `User` — usuario espejo del de Keycloak (linkeado por `sub` = UUID Keycloak).
- `UserSettings` — preferencias por usuario.

## Servicios internos

- `UserService` — lógica de negocio.
- `KeycloakService` — talks to the Keycloak Admin API (registro programático, social-register).

## Endpoints relevantes

- `POST /api/v1/users/register` — registro tradicional.
- `POST /api/v1/users/social-register` — **idempotente**, requiere JWT. Si el usuario ya existe en DB devuelve su perfil; si no, crea DB record + settings + categorías default ([[source-notas-google-smtp]]).
- `GET /api/v1/users/health` — único endpoint público (sin auth) en todo el sistema.

## Feign clients

- `AccountServiceClient` — para crear categorías default al registrar un usuario nuevo (vía [[account-service]]).

## Conexiones

- Sincroniza con → [[keycloak]] (Admin API)
- Llama a → [[account-service]] (crear categorías default)
- Identidad de usuario → claim `sub` del JWT vía header `X-User-Id` ([[concept-jwt-x-user-id]])

## Estado / pendientes

- Social register existe pero requiere activar Google OAuth completo ([[source-notas-google-smtp]]).
