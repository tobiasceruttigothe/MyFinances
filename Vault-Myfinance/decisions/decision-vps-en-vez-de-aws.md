---
type: decision
status: stable
created: 2026-06-09
updated: 2026-06-09
sources: [[deployment-infra-plan]], [[overview]]
---

# ADR — VPS con Kubernetes en vez de AWS

## Decisión

El destino de producción de MyFinances pasa a ser un **VPS común con Kubernetes (k3s)**.
**AWS deja de ser el objetivo del proyecto** (era el "Project Goal" histórico del CLAUDE.md).

Decidido por Tobías el **2026-06-09** durante el análisis 360 del proyecto.

## Contexto

- El objetivo original era usar MyFinances como banco de pruebas para deployar en AWS (EKS + ALB + RDS).
- En [[deployment-infra-plan]] ya existía un paso intermedio: server casero (notebook vieja + Ubuntu Server + k3s) + Cloudflare Named Tunnel, con AWS como "destino final".
- Un VPS con k3s cubre lo que el proyecto necesita (cluster 24/7, dominio propio `myfinances.qzz.io`, HTTPS vía Cloudflare) a una fracción del costo y la complejidad de EKS. El aprendizaje de Kubernetes se mantiene intacto porque k3s es Kubernetes conforme.

## Consecuencias

- **Se mantiene**: todo el trabajo en `backend/k8s/` — los manifiestos son la base del deploy en k3s (cambia `storageClassName` implícito a `local-path` y la estrategia de imágenes).
- **Cambia**:
  - Las imágenes ya no pueden ser `imagePullPolicy: Never` + build en el daemon de Minikube. Opciones: registry privado (GHCR gratis con el repo) o `k3s ctr images import`. Recomendado: **GHCR + imagePullSecrets**.
  - Exposición: Cloudflare **Named Tunnel** (token fijo) o Cloudflare DNS + ingress (Traefik viene incluido en k3s) con cert-manager. El túnel evita abrir puertos del VPS.
  - Secrets: ya no hay Secrets Manager de AWS; usar Secrets de k8s poblados fuera de git (los `*-secrets.yaml` versionados quedan como templates con placeholders) o sealed-secrets/SOPS si se quiere GitOps.
  - Postgres: sigue siendo el pod con PVC (no hay RDS). Esto **exige backups propios** (CronJob `pg_dump` + copia fuera del VPS).
- **El server casero** (notebook vieja) queda como banco de pruebas opcional previo al VPS — misma mecánica k3s, costo cero.

## Alternativas descartadas

- **AWS (EKS/RDS)**: costo y complejidad desproporcionados para un proyecto personal; el valor pedagógico ya se obtiene operando k3s.
- **Docker Compose en el VPS**: más simple, pero pierde la paridad con Kubernetes que es parte del objetivo de aprendizaje.
