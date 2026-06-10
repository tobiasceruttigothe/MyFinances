---
type: concept
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-claude-md]], [[source-notas-google-smtp]]
---

# Autenticación con Keycloak

Modelo de identidad de MyFinances.

## Componentes

- [[keycloak]] — IdP, emisor de JWT, dueño del realm `myfinances-realm`.
- [[gateway-service]] — único validador de JWT ([[concept-jwt-x-user-id]]).
- [[user-service]] — mantiene un espejo del usuario en DB; talks to Keycloak Admin API.

## Flujos

### Login tradicional (usuario + password)
1. Cliente → `POST /realms/myfinances-realm/protocol/openid-connect/token` en Keycloak.
2. Recibe access token + refresh token.
3. Usa el access token contra el gateway en cada request.

### Registro tradicional
1. Cliente → `POST /api/v1/users/register` (via gateway).
2. [[user-service]] crea usuario en Keycloak (Admin API) + en DB local + settings + categorías default.

### Social login (Google) — **pendiente activar**
1. Frontend muestra "Continuar con Google" → PKCE redirect.
2. Google → Keycloak (broker endpoint) → emite JWT propio de Keycloak.
3. Frontend recibe el code, lo intercambia, llama `POST /api/v1/users/social-register` (idempotente).
4. user-service crea el record local si no existe.

Detalles operativos en [[source-notas-google-smtp]]:
- Falta `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` reales en `backend/k8s/keycloak-secrets.yaml`.
- Authorized redirect URI: `http://localhost:8082/realms/myfinances-realm/broker/google/endpoint`.
- Fresh deploy de Keycloak después de cambiar el Secret (`kubectl delete pod -l app=keycloak`, opcional `kubectl delete pvc keycloak-db-pvc`).

## SMTP (verificación de email)

- Config `smtpServer` en el realm JSON con `${env.SMTP_*}`.
- Apunta a Gmail por default.
- `verifyEmail: false` por ahora; activar desde la consola de Keycloak cuando el SMTP funcione.

## Whitelist pública

Único endpoint sin token: `GET /api/v1/users/health`. Todo lo demás requiere `Authorization: Bearer <jwt>`.
