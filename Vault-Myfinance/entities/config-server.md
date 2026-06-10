---
type: entity
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-claude-md]]
---

# config-server

Spring Cloud Config Server. Punto único de configuración para todos los demás servicios.

## Datos clave

- **Puerto**: 8888
- **Stack**: Spring Cloud Config Server
- **Repo de config**: `https://github.com/tobiasceruttigothe/myfinances-config-data.git` ([[source-claude-md]])
- **Path local**: `backend/config-server/`

## Cómo lo consumen los servicios

Cada microservicio tiene un `bootstrap.properties` (o `bootstrap.yml` en el gateway) que apunta al config-server al arrancar. Configurado con **retry** (6 intentos, exponential backoff) para tolerar que el config-server tarde en estar listo dentro del cluster ([[source-claude-md]]).

## Conexiones

- Provee config a → [[user-service]], [[account-service]], [[investment-service]], [[goals-service]], [[gateway-service]]
- Lee desde → repo GitHub `myfinances-config-data`

## Decisiones relacionadas

- [[decision-config-en-github]] — por qué la config vive fuera del repo de código.
