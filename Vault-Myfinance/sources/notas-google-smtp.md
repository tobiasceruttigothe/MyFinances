---
type: source
status: stable
created: 2026-05-16
updated: 2026-05-16
---

# Fuente — notas (Google OAuth + SMTP)

**Tipo**: archivo de notas suelto en la raíz del repo.
**Ruta**: `notas` (sin extensión).
**Contexto**: trabajo en curso al commit `291c1db` (2026-03-05).

## Resumen

Pasos pendientes para activar:

### 1. Google OAuth (PKCE)
- Keycloak: IDP Google configurado con placeholders `${env.GOOGLE_CLIENT_ID}` / `${env.GOOGLE_CLIENT_SECRET}`.
- K8s: `keycloak-secrets.yaml` con los placeholders a reemplazar.
- `deploy-k8s.sh` aplica el Secret antes de levantar Keycloak.
- Frontend: botón "Continuar con Google" → PKCE redirect → `/auth/callback` → intercambia code → `POST /api/v1/users/social-register`.
- PKCE helpers: `frontend/src/lib/pkce.ts`.

### 2. SMTP
- Config `smtpServer` en realm JSON con `${env.SMTP_*}`.
- Apunta a Gmail SMTP por default.
- `verifyEmail: false` por ahora (activar desde consola Keycloak → Realm Settings → Email).

### 3. user-service
- Nuevo endpoint `POST /api/v1/users/social-register` — idempotente, requiere JWT.
- Si el user ya existe en DB → devuelve perfil; si no → crea DB record + settings + categorías.

## Activación de Google OAuth (procedimiento)

1. Google Cloud Console → crear proyecto → Credentials → OAuth 2.0 Client ID.
2. Authorized redirect URI: `http://localhost:8082/realms/myfinances-realm/broker/google/endpoint`.
3. Editar `backend/k8s/keycloak-secrets.yaml` con Client ID + Secret reales.
4. Fresh deploy de Keycloak (necesita reimportar el realm):
   ```bash
   kubectl delete pod -l app=keycloak
   kubectl delete pvc keycloak-db-pvc   # opcional, limpia DB de Keycloak
   cd backend && ./deploy-k8s.sh
   ```

## Páginas del wiki que derivan de esta fuente

- [[user-service]] (endpoint `social-register`)
- [[keycloak]] (config Google IDP, SMTP)
- [[concept-auth-keycloak]] (flujo completo)
- [[overview]] (sección de pendientes)
