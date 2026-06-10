---
type: entity
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-claude-md]], [[source-notas-google-smtp]]
---

# keycloak

Identity Provider y emisor de JWTs. **Fuente de verdad de identidad**; el resto del sistema solo confía en `X-User-Id` derivado de su JWT.

## Datos clave

- **Versión**: 23.0.0 ([[source-claude-md]])
- **Puerto interno (cluster)**: 8082
- **Realm**: `myfinances-realm`
- **Credenciales de prueba**: `usuario@test.com` / `Test@1234` (el username `usuario_prueba` existe en el realm, pero `POST /api/v1/users/login` valida `email` con `@Email` → el username devuelve 400 antes de llegar a Keycloak; la password real en `backend/keycloak-config/realm-export.json:131` es `Test@1234`, no `1234`. Confirmado empíricamente al 2026-05-16 contra el deploy del usuario)
- **Manifests**: `backend/k8s/keycloak.yaml`, `keycloak-db.yaml`, `keycloak-configmap.yaml`, `keycloak-secrets.yaml`
- **Realm import**: `backend/keycloak-config/`

## Integraciones

- **Validación**: el [[gateway-service]] valida tokens contra el JWK Set URI público de Keycloak.
- **Admin API**: [[user-service]] (`KeycloakService`) crea/sincroniza usuarios programáticamente.
- **Google OAuth (PKCE)** — IDP configurado con placeholders `${env.GOOGLE_CLIENT_ID}` / `${env.GOOGLE_CLIENT_SECRET}` que vienen de `keycloak-secrets.yaml`. **Pendiente activar** ([[source-notas-google-smtp]]).
- **SMTP** — config `smtpServer` en realm JSON con `${env.SMTP_*}`. Apunta a Gmail SMTP por default. `verifyEmail: false` hasta tener SMTP funcionando.

## Port-forward útil

```bash
kubectl port-forward svc/keycloak 8082:8082    # standard (CLAUDE.md)
# o bien (de los pasos manuales):
kubectl port-forward svc/keycloak 9090:8080
```

> **Inconsistencia detectada**: [[source-claude-md]] dice `8082:8082`, mientras [[source-pasos]] dice `9090:8080`. Verificar cuál es el puerto interno real del Service. (TODO: revisar `backend/k8s/keycloak.yaml`).

## Conexiones

- Emite tokens consumidos por → [[gateway-service]]
- Admin API usada por → [[user-service]]
- IDP federado: Google (pendiente)
- SMTP: Gmail (pendiente)
