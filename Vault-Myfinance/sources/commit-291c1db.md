---
type: source
status: stable
created: 2026-05-16
updated: 2026-05-16
---

# Fuente — commit 291c1db

**Hash**: `291c1db`
**Fecha**: 2026-03-05
**Mensaje**: _"falta implementar autenticacion con google y smtp"_
**Estado**: commit más reciente al 2026-05-16 (HEAD de `main`).

## Qué introduce (inferido del mensaje + [[source-notas-google-smtp]])

Infraestructura para:
- Google OAuth (PKCE) con Keycloak como broker.
- SMTP para verificación de email (Gmail por default).
- Endpoint `social-register` en [[user-service]].
- Helpers PKCE en `frontend/src/lib/pkce.ts`.

## Pendiente al cierre del commit

- Cargar credenciales reales de Google en `keycloak-secrets.yaml`.
- Activar SMTP con credenciales reales.
- Activar `verifyEmail: true` en Keycloak.

## Páginas que derivan

- [[concept-auth-keycloak]]
- [[user-service]]
- [[keycloak]]
- [[overview]] (sección "Lo que falta")
