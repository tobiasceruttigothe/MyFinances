---
type: decision
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-commit-b0eabac]], [[source-commit-10de551]]
---

# Decisión — Chau Eureka, hola Kubernetes

**Fecha de la decisión**: 2026-01-19 (commits `b0eabac` y `10de551`).

## Contexto

El proyecto arrancó con la receta clásica Spring Cloud: **Netflix Eureka** como service discovery. Después de ~6 commits intentando que la conexión con Eureka funcionara dentro de Docker (commits `80731de` _"sigue sin funcionar la conexion a eureka"_, `28770a2` _"falla al levantar con docker"_), se descartó Eureka.

## Decisión

Migrar todo el discovery a **Kubernetes Services** (DNS interno del cluster). Cada servicio se referencia por su nombre + puerto: `http://account-service:8081`, etc.

Commit `b0eabac` (_"chau eureka hola kubernetes"_) — implementación.
Commit `10de551` (_"limpieza de eureka"_) — eliminación de las dependencias y configs residuales.

## Consecuencias

**Positivas**:
- Una pieza menos que mantener (Eureka Server + clientes en cada servicio).
- Discovery confiable: si el Service existe, el DNS funciona; si no, falla rápido.
- Health checks delegados a Kubernetes (`livenessProbe`, `readinessProbe`).
- Habilita el siguiente paso: AWS EKS (objetivo del proyecto).

**Negativas / trade-offs**:
- Acoplamiento al ecosistema K8s. No es trivial correr esto en docker-compose puro (aunque `backend/docker-compose.yml` sigue existiendo — verificar si se mantiene).
- Pérdida de features de Eureka que no tienen equivalente directo (status pages, dashboard).
- Si en el futuro se necesita load balancing client-side fino (no round-robin de K8s), habrá que reintroducir algo.

## Conceptos relacionados

- [[concept-feign-resilience]] — Feign sigue funcionando, ahora apuntando a DNS de K8s en vez de a un service registry.
- [[concept-deploy-minikube]] — el modelo de deploy resultante.
