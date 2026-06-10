---
type: analysis
status: superseded
created: 2026-05-17
updated: 2026-05-17
sources: [[user-service]], [[gateway-service]], [[frontend]], [[keycloak]]
---

# Bug · La sesión se pierde al vencer el access token (refresh roto por snake_case)

**Severidad**: alta (cortaba la experiencia de uso a los ~5 min — duración default del access token de Keycloak).
**Reportado**: 2026-05-17, sesión con Tobías ("me logueo pero el token dura cierto tiempo y se vence y pierdo la sesión").
**Estado**: ✅ **FIXEADO en commit `c0b2e94 fix(user-service): wrap refresh-token response in camelCase DTO`** (2026-05-17, opción A del fix). Verificado empíricamente en Minikube: login + refresh → respuesta `{accessToken, refreshToken, expiresIn: 300, tokenType: "Bearer"}`.

## Síntoma

- Login funciona OK.
- A los ~5 minutos de uso, cualquier request siguiente termina deslogueando al usuario y mandándolo a `/login`.
- Reload posterior tampoco rescata la sesión.

## La pista falsa

A primera vista parece que falta implementar refresh. **No**: el refresh ya existe en ambos lados.

- **Frontend** (`frontend/src/api/client.ts:20-72`): interceptor de respuesta `axios`. Al recibir 401 con un request original que no haya intentado refresh aún (`!original._retry`), llama `POST /api/v1/users/refresh-token` con el `refreshToken` de `localStorage`, actualiza el store con los nuevos tokens vía `setTokens()`, y reintenta el request original. Tiene además una `failedQueue` para no disparar refresh paralelos cuando hay concurrencia.
- **Frontend boot** (`frontend/src/App.tsx:18-39`, componente `SessionRestorer`): al montar, lee `refreshToken` de localStorage y, si existe, llama `authApi.refreshToken(...)` + `getProfile()` para rehidratar la sesión. Esto cubre el caso de reload.
- **Gateway** (`backend/gateway-service/src/main/java/com/myfinances/gateway_service/config/SecurityConfig.java:37`): `/api/v1/users/refresh-token` está en `permitAll()`. No requiere Bearer token. **Nota**: [[source-claude-md]] está stale en este punto — dice "Gateway whitelist (no auth required): only `GET /api/v1/users/health`" pero el SecurityConfig actual permitea también `register`, `login`, `refresh-token`, `health` y `/actuator/**`.
- **Backend** (`backend/user-service/src/main/java/com/myfinances/user/controller/UserController.java:48-55` → `UserService.refreshToken()` → `KeycloakService.refreshToken()`): wrappea correctamente el call a Keycloak con `grant_type=refresh_token`.

## Root cause

`UserService.refreshToken()` (línea 104) devuelve **el `Map<String, Object>` crudo de la respuesta de Keycloak**, sin transformar. Keycloak (y todo OAuth2 standard) usa **snake_case** en los claims de respuesta:

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "token_type": "Bearer",
  "scope": "..."
}
```

Spring serializa el Map a JSON manteniendo los keys → el frontend recibe snake_case.

Pero el frontend (`api/client.ts:60`) hace:

```ts
const { data } = await axios.post(`${BASE_URL}/api/v1/users/refresh-token`, { refreshToken })
useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
//                                ^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^
//                                  undefined          undefined
```

`setTokens(undefined, undefined)` hace `localStorage.setItem('refreshToken', undefined)` — que guarda el **string literal `"undefined"`** (porque `setItem` coerciona a string). Y setea `accessToken: undefined` en el store. Resultado: el siguiente interceptor que dispare refresh leerá `"undefined"` (truthy!), lo mandará a Keycloak, Keycloak responde "invalid refresh token", la rama `.catch()` corre `logout()` y limpia todo. Sesión perdida.

El reload tampoco salva: `SessionRestorer` lee `"undefined"`, llama refresh, falla, ejecuta `localStorage.removeItem('refreshToken')`.

## Evidencia comparativa

`UserService.login()` (línea ~85-100) **sí** mapea bien la respuesta de Keycloak a un DTO camelCase:

```java
return LoginResponse.builder()
    .accessToken((String) tokenResponse.get("access_token"))
    .refreshToken((String) tokenResponse.get("refresh_token"))
    .expiresIn((Integer) tokenResponse.get("expires_in"))
    .tokenType((String) tokenResponse.get("token_type"))
    .userId(userId)
    ...
    .build();
```

Por eso el login funciona y el refresh no.

## Fixes

### A) Backend (recomendado) — un solo cambio, sin tocar el frontend

En `UserService.refreshToken()` y/o `UserController.refreshToken()`: construir un DTO con campos camelCase (similar a `LoginResponse`, pero sin los datos de usuario que el refresh no devuelve) y devolver eso en lugar del Map crudo.

```java
public RefreshTokenResponse refreshToken(String refreshToken) {
    if (refreshToken == null || refreshToken.trim().isEmpty()) {
        throw new IllegalArgumentException("El refresh token no puede estar vacío");
    }
    Map<String, Object> kc = keycloakService.refreshToken(refreshToken);
    return RefreshTokenResponse.builder()
        .accessToken((String) kc.get("access_token"))
        .refreshToken((String) kc.get("refresh_token"))
        .expiresIn((Integer) kc.get("expires_in"))
        .tokenType((String) kc.get("token_type"))
        .build();
}
```

Donde `RefreshTokenResponse` es un nuevo DTO en `backend/user-service/src/main/java/com/myfinances/user/dto/`. El tipo equivalente en el frontend ya existe (`frontend/src/types/auth.ts` línea 30-35).

Cambio mínimo, consistente con `login`, y deja el frontend intacto.

### B) Frontend (workaround) — desaconsejado

Leer snake_case desde el frontend específicamente para el refresh response. Mete divergencia entre `LoginResponse` (camelCase) y `RefreshTokenResponse` (snake_case) y deja el backend rompiendo el contrato de su propia API.

## Hardening opcional (independiente del fix)

Estas no son parte del bug pero conviene atacarlas para resiliencia:

1. **Frontend `setTokens` debería validar inputs**: si `refreshToken` viene undefined/empty, no guardarlo. Hoy guarda el string `"undefined"` sin chequear.
2. **Frontend `SessionRestorer` debería validar el string leído**: si `localStorage.getItem('refreshToken') === 'undefined'`, tratar como ausente.
3. **Backend `UserService.refreshToken` ya valida null/empty pero no chequea el string "undefined"** — el fix A elimina la posibilidad de que llegue ese string desde adelante.

## Plan de fix (cuando se ataque)

1. Crear `RefreshTokenResponse` DTO en `backend/user-service/src/main/java/com/myfinances/user/dto/`. Campos: `accessToken`, `refreshToken`, `expiresIn`, `tokenType` (todos camelCase).
2. Modificar `UserService.refreshToken()` para construir y devolver el DTO. Cambiar la firma a `RefreshTokenResponse` (no `Map<String, Object>`).
3. Modificar `UserController.refreshToken()` para devolver `ResponseEntity<RefreshTokenResponse>`.
4. Rebuild + redeploy del user-service: `cd backend && ./rebuild.sh && kubectl rollout restart deployment/user-service -n default`.
5. Test empírico: login → esperar 5 min (o configurar TTL menor en Keycloak para acelerar) → hacer una request → confirmar que la sesión sobrevive sin redirigir a `/login`. Alternativa más rápida: invalidar el access token manualmente desde DevTools (`localStorage.setItem('accessToken', 'xxx')` — pero el access no está en localStorage; está en memoria del store).
6. Cleanup defensivo en el frontend (opcional pero recomendado): agregar el check de `"undefined"` string en `SessionRestorer` y `setTokens`.
7. Actualizar [[source-claude-md]]: la whitelist del gateway no es sólo `health`.

## Estado

- ✅ Bug **fixeado** en commit `c0b2e94` (2026-05-17, opción A — wrap en DTO camelCase). Rebuild de imagen + rollout del deployment hechos en la misma sesión, verificación empírica OK.
- ✅ [[source-claude-md]] actualizado: la sección "Authentication" ahora lista correctamente la whitelist completa (`OPTIONS`, `register`, `login`, `refresh-token`, `health`, `/actuator/**`).
- ✅ **Hardening defensivo del frontend cerrado** en commit `df521c5 fix(auth): harden refresh-token plumbing against poisoned localStorage` (2026-05-17). Tres chequeos:
  1. `authStore.setTokens` rechaza inputs `undefined`/`null`/empty con `console.error` antes de tocar localStorage.
  2. `App.SessionRestorer` trata `"undefined"`/`"null"` (strings literales) en localStorage como ausentes y los **self-healea** con `removeItem`. **Esto desbloquea usuarios que ya tengan localStorage envenenado** del bug histórico — no necesitan limpiar a mano.
  3. Interceptor 401 en `api/client.ts` aplica el mismo chequeo defensivo antes de mandar a Keycloak.
- ⚠️ Tests JUnit del user-service están **rotos de antes** (`@WebMvcTest` falla por context loading — no relacionado con este fix, pre-existing). El fix se valida via Postman/empirismo, no JUnit. Investigar el setup de tests aparte si se quiere CI verde.
