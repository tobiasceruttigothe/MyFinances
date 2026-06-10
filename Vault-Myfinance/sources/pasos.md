---
type: source
status: stable
created: 2026-05-16
updated: 2026-05-16
---

# Fuente — pasos (run-book mínimo)

**Tipo**: archivo de notas en la raíz del repo.
**Ruta**: `pasos`.

## Contenido literal

```
corremos rebuild, corremos el deploy, ejecutamos portwardfoward:

# Terminal 1 — gateway
kubectl port-forward svc/gateway-service 8080:8080

# Terminal 2 — keycloak  
kubectl port-forward svc/keycloak 9090:8080

ajustamos la coleccion y probamos la coleccion....
```

## Observación

El port-forward de Keycloak figura como `9090:8080` (puerto local 9090, puerto del Service 8080).
[[source-claude-md]] dice `8082:8082`. **Hay inconsistencia** — verificar `backend/k8s/keycloak.yaml` para determinar cuál es el puerto real del Service.

Esta contradicción está señalada en [[keycloak]] y [[concept-deploy-minikube]].

## Páginas relacionadas

- [[concept-deploy-minikube]]
- [[keycloak]]
