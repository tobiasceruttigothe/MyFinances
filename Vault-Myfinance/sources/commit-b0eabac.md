---
type: source
status: stable
created: 2026-05-16
updated: 2026-05-16
---

# Fuente — commit b0eabac

**Hash**: `b0eabac`
**Fecha**: 2026-01-19
**Mensaje**: _"chau eureka hola kubernetes"_

## Qué introduce

Pivote arquitectónico: reemplazo de **Netflix Eureka** como service discovery por **Kubernetes Services** (DNS interno del cluster).

Contexto inmediato (commits previos):
- `80731de` (2026-01-16) — _"sigue sin funcionar la conexion a eureka"_
- `28770a2` (2026-01-13) — _"falla al levantar con docker"_

Decisión tomada después de iteraciones fallidas con Eureka en Docker.

## Páginas que derivan

- [[decision-chau-eureka-hola-k8s]] (el porqué + consecuencias)
- [[concept-feign-resilience]] (Feign ahora apunta a DNS de K8s)
- [[concept-deploy-minikube]]
