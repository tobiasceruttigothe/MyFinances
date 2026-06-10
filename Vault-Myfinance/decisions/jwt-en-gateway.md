---
type: decision
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-claude-md]]
---

# Decisión — JWT solo en el gateway

## Contexto

Cada microservicio podría validar JWT por su cuenta (cada uno tendría su `SecurityFilterChain` con OAuth2 Resource Server contra el JWK Set URI de [[keycloak]]). Eso es robusto pero introduce:
- Coste criptográfico repetido por request (1 verificación por cada hop interno).
- Dependencia de cada servicio con Keycloak (URL, JWK URI, refresh de claves).
- Más superficie de error: si un servicio queda con config vieja, falla en producción.

## Decisión

**Solo el [[gateway-service]] valida JWTs**. Extrae el claim `sub` y lo propaga como header `X-User-Id`. Los servicios downstream confían en ese header sin más validación ([[concept-jwt-x-user-id]]).

## Consecuencias

**Positivas**:
- Validación criptográfica única por request.
- Servicios downstream no necesitan saber nada de Keycloak/OAuth2.
- Multi-tenancy uniforme: filtrar por `X-User-Id` es trivial en queries.

**Negativas / riesgos**:
- **Si un servicio downstream queda expuesto públicamente, suplantar usuarios es trivial** (basta con mandar `X-User-Id: <uuid>`). El modelo de seguridad depende de que K8s no exponga los services de dominio fuera del cluster (deben ser `ClusterIP`, no `LoadBalancer`/`NodePort`).
- En un futuro mesh con mTLS, esto se complementa naturalmente. Por ahora, la red interna de K8s es la única defensa.
- Imposible hacer auth diferenciada por scope/role en el servicio destino sin reenviar el JWT entero (lo cual derrota parte de la decisión).

## Mitigaciones

- Manifests de servicios de dominio deben mantener `type: ClusterIP` (default). Verificar en `backend/k8s/*-service.yaml`.
- En AWS: ALB/ingress controller solo apunta al gateway; ningún Target Group apunta a servicios de dominio.
