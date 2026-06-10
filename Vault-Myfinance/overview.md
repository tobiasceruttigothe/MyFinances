---
type: analysis
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-claude-md]], [[source-commit-291c1db]], [[source-commit-f55ab39]], [[source-design-handoff-cuaderno]]
---

# Overview — MyFinances

Síntesis viva del proyecto. Esta página responde la pregunta "¿qué es MyFinances y dónde está?". Se actualiza cuando una ingesta cambia la tesis general; los detalles finos viven en `entities/`, `concepts/`, `decisions/`.

## Qué es

**MyFinances** es una app de gestión de finanzas personales con backend de **microservicios Spring Cloud** desplegado en **Minikube/Kubernetes**. El destino de producción es un **VPS común con k3s** ([[decision-vps-en-vez-de-aws]], 2026-06-09 — AWS dejó de ser el objetivo).

El backend es estable y testeado vía Postman/Newman (63 asserts verdes). El [[frontend]] **existe completo a nivel de scaffolding** (React 19 + Vite 7 + Tailwind v4 + shadcn/Radix + TanStack Query + Zustand) — [[source-claude-md]] está stale en este punto, decía "currently empty". En mayo 2026 entró un design handoff de alta fidelidad ([[source-design-handoff-cuaderno]]) introduciendo la identidad visual **"Cuaderno"** ([[concept-sistema-cuaderno]]), pendiente aplicar (Paso 1 ya hecho — ver [[log]]).

## Arquitectura en un párrafo

Un **gateway** ([[gateway-service]]) en puerto 8080 valida JWTs contra **Keycloak** ([[keycloak]], realm `myfinances-realm`), extrae el claim `sub` y lo propaga como header `X-User-Id` a los servicios downstream. Los servicios de dominio ([[account-service]], [[investment-service]], [[goals-service]], [[user-service]]) **confían ciegamente** en ese header y no validan JWTs por su cuenta ([[concept-jwt-x-user-id]]). La config viene de un [[config-server]] que lee de un repo externo en GitHub. La comunicación inter-servicio usa **Feign + Resilience4j** con fallbacks ([[concept-feign-resilience]]). Tracing distribuido con Zipkin.

## Servicios

| Servicio | Puerto | Responsabilidad | Página |
|---|---|---|---|
| gateway-service | 8080 | JWT + ruteo | [[gateway-service]] |
| config-server | 8888 | Config centralizada | [[config-server]] |
| user-service | 8084 | Registro + Keycloak sync | [[user-service]] |
| account-service | 8081 | Transacciones, categorías, balance | [[account-service]] |
| investment-service | 8083 | Inversiones (puede crear EXPENSE en account) | [[investment-service]] |
| goals-service | 8085 | Metas de ahorro + scheduler | [[goals-service]] |
| keycloak | 8082 | IdP, emisor de JWT | [[keycloak]] |
| zipkin | 9411 | Tracing distribuido | [[zipkin]] |

## Estado actual (al 2026-05-16)

- **Backend estable**, 63 asserts Postman en verde. Único failure esperado: login directo a Keycloak sin port-forward :8082 ([[source-claude-md]]).
- **Último commit**: `291c1db` (2026-03-05) — _"falta implementar autenticacion con google y smtp"_. Hay infraestructura para Google OAuth (PKCE) y SMTP, pero está pendiente activarla con credenciales reales ([[source-notas-google-smtp]]).
- **Frontend**: directorio `frontend/design_handoff_my_finances/` aparece sin trackear (no se ha leído contenido en el wiki todavía — pendiente ingerir).
- **Hito reciente**: migración de Eureka a Kubernetes ([[decision-chau-eureka-hola-k8s]], commits `b0eabac` / `10de551`, 2026-01-19).

## Decisiones cardinales

- [[decision-chau-eureka-hola-k8s]] — discovery delegado a Kubernetes Services (DNS interno) en lugar de Eureka.
- [[decision-jwt-en-gateway]] — validación JWT solo en el gateway; servicios downstream confían en `X-User-Id`.
- [[decision-config-en-github]] — configuración fuera del repo de código, en un repo dedicado.

## Lo que falta / próximos pasos

- Activar Google OAuth: crear OAuth Client en Google Cloud Console, llenar `keycloak-secrets.yaml`, redeploy de Keycloak ([[source-notas-google-smtp]] tiene los pasos).
- Activar SMTP real y `verifyEmail: true` desde la consola de Keycloak.
- Aplicar los pasos 2-7 del plan de migración Cuaderno ([[source-handoff-readme]] § 6). Paso 1 (tokens CSS + Google Fonts) ya aplicado al 2026-05-16 — ver [[log]].
- Pasar de Minikube a un **VPS con k3s** + dominio `myfinances.qzz.io` (Cloudflare). Es el objetivo declarado del proyecto desde 2026-06-09 ([[decision-vps-en-vez-de-aws]]); AWS quedó descartado.

## Cómo se opera el deploy

Resumen ([[concept-deploy-minikube]] tiene el detalle):

```bash
cd backend && ./rebuild.sh         # build de imágenes en el daemon de Minikube
cd backend && ./deploy-k8s.sh      # databases → keycloak → config-server → services → gateway → zipkin
kubectl get pods -n default        # verificar
kubectl port-forward svc/gateway-service 8080:8080   # exponer gateway local
kubectl port-forward svc/keycloak 8082:8082          # exponer Keycloak (para login directo en tests)
```

Tests:
```bash
cd backend/postman && newman run MyFinances_API.postman_collection.json -e MyFinances_Environment.postman_environment.json
```

Credenciales de prueba: **`usuario@test.com` / `Test@1234`** (el username `usuario_prueba` existe en Keycloak pero `POST /api/v1/users/login` valida `email` con `@Email`, así que el username no entra como login input — usar el email; ver [[keycloak]]).
