---
type: decision
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-claude-md]]
---

# Decisión — Config en repo GitHub separado

## Contexto

Spring Cloud Config Server soporta varios backends (filesystem, git, vault, JDBC). Se eligió un **repo Git externo dedicado**: `https://github.com/tobiasceruttigothe/myfinances-config-data.git`.

## Decisión

La config no vive en el repo de código (MyFinances) ni embebida en los manifests de K8s. Vive en un repo aparte que el [[config-server]] clona/pulea.

## Consecuencias

**Positivas**:
- **Separación de cambio de config vs cambio de código**: rotar un valor de config no requiere rebuildear imágenes ni redeploy de los servicios (basta con que el config-server refresque).
- Auditoría natural via `git log` del repo de config.
- Posibilidad de tener distintos branches/profiles (dev/staging/prod) sin tocar el código.

**Negativas / riesgos**:
- **Secretos NO van acá** (es un repo, probablemente público). Los secrets reales viven en `backend/k8s/keycloak-secrets.yaml` y similares (Kubernetes Secrets).
- Una indisponibilidad del config-server o del repo GitHub al arrancar implica retry. Por eso cada servicio tiene 6 intentos con backoff exponencial en su `bootstrap.properties` ([[concept-deploy-minikube]]).
- Para deploy en AWS hay que pensar si el config-server sigue tirando contra GitHub o si se reemplaza por AWS AppConfig / Parameter Store / S3.

## Conceptos relacionados

- [[concept-deploy-minikube]] — orden de arranque y retry policy.
- [[config-server]] — la entidad que materializa esta decisión.
