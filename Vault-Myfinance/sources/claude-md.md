---
type: source
status: stable
created: 2026-05-16
updated: 2026-05-16
---

# Fuente — CLAUDE.md (raíz del repo)

**Tipo**: documento de instrucciones para LLMs en el repo.
**Ruta**: `CLAUDE.md` (raíz del proyecto).
**Última actualización conocida**: estado al 2026-05-16.

## Qué define

Manual operacional del repo. Cubre:
- Comandos de build/deploy (Kubernetes/Minikube, single service, Postman/Newman).
- Tabla de servicios con puerto y responsabilidad.
- Modelo de request flow (gateway valida JWT → propaga `X-User-Id`).
- Modelo de inter-service (Feign + Resilience4j, DNS de K8s).
- Modelo de config (config-server lee de GitHub).
- Modelo de auth (Keycloak realm + credenciales de prueba).
- Tech stack (Java 21, Spring Boot 3.2.12, Spring Cloud 2023.0.4, Postgres, Keycloak 23.0.0).
- Guidelines de desarrollo (correr tests, comentarios en inglés).
- Goal del proyecto: banco de pruebas para deploy en AWS.

## Páginas del wiki que derivan de esta fuente

- [[overview]]
- Toda la sección `entities/` (datos básicos y puertos)
- [[concept-jwt-x-user-id]], [[concept-feign-resilience]], [[concept-deploy-minikube]], [[concept-auth-keycloak]]
- [[decision-jwt-en-gateway]], [[decision-config-en-github]]

## Citas literales útiles

> "Gateway validates JWT via Keycloak JWK Set URI, extracts `X-User-Id` claim"
> "Downstream services trust this header for user identity — they never validate JWTs themselves"
> "All 63 assertions should pass. The only expected failure is Keycloak direct login when port-forward :8082 is not active."
> "The goal of this project is to design the most complete personal finance system possible and then use it as a test for deployment on AWS."
