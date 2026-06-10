---
type: entity
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-claude-md]]
---

# gateway-service

API Gateway de MyFinances. Único punto de entrada público del backend.

## Datos clave

- **Puerto**: 8080
- **Stack**: Spring Cloud Gateway (reactive), Spring Security (OAuth2 Resource Server)
- **Paquete**: `com.myfinances.gateway_service`
- **Archivos clave**:
  - `backend/gateway-service/src/main/java/com/myfinances/gateway_service/filter/JwtAuthenticationFilter.java` — valida JWT y propaga `X-User-Id`
  - `backend/gateway-service/src/main/java/com/myfinances/gateway_service/config/SecurityConfig.java`
  - `backend/gateway-service/src/main/java/com/myfinances/gateway_service/config/CorsConfig.java`

## Responsabilidades

1. **Validar JWTs** emitidos por [[keycloak]] usando JWK Set URI.
2. **Extraer `sub`** del token y propagarlo a downstream como header `X-User-Id` ([[concept-jwt-x-user-id]]).
3. **Rutear** a los servicios de dominio según path (`/api/v1/users/**` → [[user-service]], etc.).
4. **CORS** para el futuro frontend.

## Whitelist

Único endpoint sin auth: `GET /api/v1/users/health` ([[source-claude-md]]).

## Conexiones

- Valida tokens emitidos por → [[keycloak]]
- Rutea a → [[user-service]], [[account-service]], [[investment-service]], [[goals-service]]
- Tracing → [[zipkin]]

## Decisiones relacionadas

- [[decision-jwt-en-gateway]] — por qué la validación vive solo acá.
