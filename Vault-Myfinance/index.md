# Index — Vault MyFinance

Catálogo de todas las páginas del wiki. Organizado por categoría. Es el primer archivo que el LLM lee al responder una consulta. Cualquier creación / renombre / eliminación de página **debe** reflejarse acá.

Convención: `- [[slug]] — resumen de una línea (status)`.

---

## Operación

- [[WIKI]] — esquema y manual operacional del wiki (stable)
- [[index]] — este archivo (stable)
- [[log]] — registro cronológico append-only (stable)

## Overview

- [[overview]] — síntesis viva del proyecto MyFinances (stable)

## Entities — servicios e infraestructura

- [[gateway-service]] — API Gateway, valida JWT, propaga `X-User-Id` (stable)
- [[config-server]] — Spring Cloud Config, lee de repo GitHub (stable)
- [[user-service]] — registro + sync con Keycloak Admin API (stable)
- [[account-service]] — transacciones, categorías, balance (stable)
- [[investment-service]] — inversiones; crea EXPENSE espejo en account (stable)
- [[goals-service]] — metas de ahorro + scheduler de contribuciones (stable)
- [[keycloak]] — IdP, realm `myfinances-realm`, emisor de JWT (stable)
- [[zipkin]] — tracing distribuido (stable)
- [[frontend]] — app React 19 + Vite 7 + Tailwind v4 (stable)

## Concepts — patrones y mecanismos transversales

- [[concept-jwt-x-user-id]] — modelo de identidad y propagación de usuario (stable)
- [[concept-feign-resilience]] — comunicación inter-servicio con circuit breakers (stable)
- [[concept-deploy-minikube]] — ciclo de build/deploy local en Kubernetes (stable)
- [[concept-auth-keycloak]] — flujos de login, registro, social login, SMTP (stable)
- [[concept-scheduling-goals]] — scheduler de contribuciones automáticas (draft)
- [[concept-sistema-cuaderno]] — identidad visual "Cuaderno" del frontend (stable)
- [[concept-cuaderno-vs-tinta-mode]] — dos paletas, un componente, switch por scope (stable)
- [[concept-frontend-stack]] — stack del frontend confirmado desde package.json (stable)

## Decisions — ADRs

- [[decision-chau-eureka-hola-k8s]] — migrar service discovery de Eureka a K8s (stable)
- [[decision-jwt-en-gateway]] — validación JWT solo en gateway, downstream confía en `X-User-Id` (stable)
- [[decision-config-en-github]] — config en repo Git externo (stable)
- [[decision-identidad-cuaderno]] — adoptar sistema visual "Cuaderno" en lugar de shadcn default (superseded por [[decision-identidad-fini]])
- [[decision-identidad-fini]] — identidad "Fini" (chanchito alcancía): paleta crema/rosa, Baloo 2 + Nunito, mascota SVG con moods (stable)
- [[decision-vps-en-vez-de-aws]] — el destino de producción es un VPS con k3s; AWS deja de ser objetivo (stable)

## Sources — material crudo

### Docs, notas y handoffs del repo
- [[source-claude-md]] — instrucciones para LLMs en la raíz del proyecto (stable — **con afirmaciones stale sobre frontend, ver [[overview]]**)
- [[source-notas-google-smtp]] — pendientes para activar Google OAuth + SMTP (stable)
- [[source-pasos]] — run-book mínimo de deploy/port-forward (stable)
- [[source-design-handoff-cuaderno]] — design handoff "Cuaderno" para el frontend (mayo 2026) (stable)
- [[source-handoff-readme]] — README del handoff: plan de migración + 10 mandamientos (stable)
- [[source-design-system-html]] — manual oficial del sistema visual con tokens copiables (stable)
- [[source-handoff-canvas]] — mockups React standalone de todas las pantallas (stable)

### Commits seed
- [[source-commit-291c1db]] — _"falta implementar autenticacion con google y smtp"_ (2026-03-05, HEAD)
- [[source-commit-f55ab39]] — _"mejorando microservicios y deploy"_ (2026-02-26)
- [[source-commit-f0d5dd8]] — agrega goals-service + fix registro inversión (2026-02-25)
- [[source-commit-b0eabac]] — _"chau eureka hola kubernetes"_ (2026-01-19)
- [[source-commit-10de551]] — _"limpieza de eureka"_ (2026-01-19)

## Analyses — síntesis archivadas

- [[next-steps-cuaderno-migration]] — roadmap accionable de Pasos 2-7 para la próxima sesión (stable)
- [[bug-refresh-token-snake-case]] — diagnosis del bug que rompía la sesión a los ~5 min (refresh devolvía snake_case, frontend leía camelCase) — **fixeado** commit `c0b2e94` (superseded)
- [[future-features-wishlist]] — wishlist de Tobías al cierre del 2026-05-17: neto visible, gastos recurrentes con inflación AR, carga por audio con IA (stable, no comprometido en roadmap)
- [[whatsapp-audio-intake]] — carga de transacciones por audio/WhatsApp con IA: **inbound e2e VIVO** (Fase 0/1/2 + Fase 3 inbound, 2026-06-07) (in-progress)
- [[deployment-infra-plan]] — dónde corre MyFinances hoy (notebook + cloudflared) y plan a futuro (dominio `myfinances.qzz.io` + server casero k3s + Named Tunnel → AWS) (in-progress)
- [[whatsapp-resume-runbook]] — estado actual de WhatsApp (VIVO con número real Fini) + cómo retomar tras apagar Minikube + **3 pendientes para "definitivo" con pasos** (token permanente, Workflow B, modo Live) (stable)
- [[analisis-360-2026-06-09]] — auditoría completa: fixes aplicados (spoofing X-User-Id, PVCs, probes, CORS, .gitignore) + backlog P0–P3 + roadmap VPS (stable)
