---
type: concept
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-claude-md]]
---

# JWT y header X-User-Id

Mecanismo de autenticación y propagación de identidad en MyFinances.

## El patrón

1. Cliente obtiene JWT de [[keycloak]] (login directo o vía social-register).
2. Cliente envía el JWT como `Authorization: Bearer <token>` al [[gateway-service]] (puerto 8080).
3. **Solo el gateway** valida el JWT (firma, expiración, issuer) contra el JWK Set URI público de Keycloak.
4. Gateway extrae el claim `sub` (UUID del usuario en Keycloak) y lo agrega como header `X-User-Id` al request reenviado.
5. Los servicios downstream ([[user-service]], [[account-service]], [[investment-service]], [[goals-service]]) **confían ciegamente** en `X-User-Id` y no validan JWTs por su cuenta.

## Por qué importa

- **Performance**: la validación criptográfica del JWT ocurre una sola vez por request.
- **Simplicidad downstream**: los servicios de dominio no necesitan saber nada de Keycloak ni de OAuth2.
- **Multi-tenancy uniforme**: todo query/comando en servicios de dominio filtra por `X-User-Id`. Es el único identificador que importa.

## Consecuencia de seguridad

**Los servicios downstream NO deben estar expuestos públicamente**. Si alguien puede mandar requests directos a `:8081` con un `X-User-Id` arbitrario, suplanta cualquier usuario. En K8s esto se garantiza porque los services de dominio son `ClusterIP` (no `LoadBalancer`/`NodePort`); solo el gateway tiene exposición externa.

## Whitelist en gateway

Único endpoint público sin JWT: `GET /api/v1/users/health` ([[source-claude-md]]).

## Implementación

- Filtro: `backend/gateway-service/src/main/java/com/myfinances/gateway_service/filter/JwtAuthenticationFilter.java`
- Config: `SecurityConfig.java`

## Decisión relacionada

- [[decision-jwt-en-gateway]] — el porqué de no validar JWT en cada servicio.
