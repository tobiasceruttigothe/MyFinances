---
type: concept
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-claude-md]], [[source-pasos]]
---

# Deploy en Minikube

Ciclo completo de build y deploy local en Kubernetes (Minikube).

## Scripts

- `backend/rebuild.sh` — buildea todas las imágenes Docker **dentro del daemon de Minikube** (`eval $(minikube docker-env)`).
- `backend/deploy-k8s.sh` — orquesta el deploy en orden: databases → [[keycloak]] → [[config-server]] → services de dominio → [[gateway-service]] → [[zipkin]].

## Manifests

`backend/k8s/` contiene un YAML por servicio:
- `postgres.yaml`, `keycloak-db.yaml`, `keycloak.yaml`, `keycloak-configmap.yaml`, `keycloak-secrets.yaml`
- `config-server.yaml`
- `user-service.yaml`, `account-service.yaml`, `investment-service.yaml`, `goals-service.yaml`
- `gateway-service.yaml`, `zipkin.yaml`

## ImagePullPolicy

Todas las imágenes propias usan `imagePullPolicy: Never` ([[source-claude-md]]). Esto fuerza a K8s a usar las imágenes locales (las que `rebuild.sh` puso en el daemon de Minikube). Si la imagen no existe localmente, el pod falla — no intenta pull a un registry remoto.

## Flujo típico de desarrollo

```bash
# Terminal de trabajo
cd backend
./rebuild.sh           # build images en Minikube
./deploy-k8s.sh        # apply manifests

kubectl get pods -n default     # verificar Running

# Terminal 1 — gateway expuesto
kubectl port-forward svc/gateway-service 8080:8080

# Terminal 2 — keycloak expuesto (necesario para login directo en Postman)
kubectl port-forward svc/keycloak 8082:8082
```

> **Nota**: [[source-pasos]] tiene `9090:8080` para Keycloak en vez de `8082:8082`. Hay que verificar el `targetPort` real en `backend/k8s/keycloak.yaml` (probablemente uno de los dos archivos está desfasado).

## Retry de bootstrap

Cada servicio tiene retry configurado en su `bootstrap.properties` (6 intentos, exponential backoff) para tolerar que el [[config-server]] tarde en levantarse. Sin esto, el servicio fallaría definitivamente si arranca antes que el config-server.
