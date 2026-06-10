---
type: analysis
status: in-progress
created: 2026-06-07
updated: 2026-06-07
sources: [[whatsapp-audio-intake]], [[concept-deploy-minikube]], [[overview]]
---

# Plan de infraestructura / despliegue

Dónde corre MyFinances hoy y a dónde va. Disparado por la necesidad de exponer n8n a
internet para los webhooks de WhatsApp (ver [[whatsapp-audio-intake]]) y por la decisión de
Tobías de armar un servidor propio antes de AWS.

## Estado HOY (2026-06-07): todo sobre la notebook de Tobías

- **Minikube** (Kubernetes local) en la notebook de trabajo de Tobías corre los ~12 pods:
  Postgres, Keycloak (+ su db), config-server, gateway, user/account/investment/goals/intake,
  zipkin, y ahora **n8n + cloudflared**.
- **Exposición a internet** = un pod **cloudflared con Quick Tunnel** (`k8s/cloudflared.yaml`,
  `--url http://n8n:5678`). Cloudflare publica una URL **aleatoria** `https://<x>.trycloudflare.com`
  que entra directo a n8n en la Minikube de la notebook.

### Cómo funciona el túnel y qué implica (la pregunta de Tobías)
- cloudflared abre una conexión **saliente** a Cloudflare y tunelea el tráfico de vuelta.
  **No se abre ningún puerto en el router de casa** → más seguro que un port-forward clásico.
- Pero **sí expone n8n a internet** mientras el pod corre, y apunta directo a la notebook.
  Protección actual: (a) login owner de n8n; (b) URL impredecible. El endpoint
  `/webhook/whatsapp` es necesariamente público (Meta lo llama).
- **Riesgo abierto**: quien conozca la URL podría postear payloads falsos al webhook. Mitigación
  pendiente: validar el **HMAC `X-Hub-Signature-256`** de Meta en n8n (con el App Secret).
- **Apagarlo cuando no se prueba**: `kubectl scale deployment/cloudflared --replicas=0`
  (reactivar con `--replicas=1`). Al apagar notebook/Minikube, el túnel muere solo. La URL
  cambia en cada reinicio → no sirve para algo estable (hay que re-pegar el Callback en Meta).

## Recursos que ya tiene Tobías para el siguiente paso

- **Dominio gratuito `myfinances.qzz.io`**, registrado/gestionado en **Cloudflare**.
- Plan de reutilizar una **notebook vieja** como servidor casero (instalarle **Ubuntu Server**)
  para este tipo de proyectos. Todavía **no** tiene VPS ni el server armado.

## Plan recomendado (intermedio, antes de AWS)

1. **Servidor casero**: Ubuntu Server en la notebook vieja. Encima, **k3s** (Kubernetes
   liviano, ideal para algo que queda prendido 24/7; mejor que Minikube para un server).
   Alternativa más simple: Docker Compose. Migrar los manifiestos de `backend/k8s/` a k3s es
   casi directo (cambia el `storageClassName` de los PVC).
2. **Ingress estable con dominio propio**: **Cloudflare Named Tunnel** (en vez del Quick Tunnel).
   Se crea en **Cloudflare Zero Trust**, da un **token**, y se mapea un subdominio estable, p.ej.
   `wa.myfinances.qzz.io` → el `Service` de n8n. URL **fija**, HTTPS automático, sin abrir puertos.
   - cloudflared corre con `--token <token>` en vez de `--url`.
   - El Callback de Meta pasa a `https://wa.myfinances.qzz.io/webhook/whatsapp` y **deja de cambiar**.
3. **Hardening**: validar HMAC del webhook; mover el estado de n8n a Postgres (en vez de SQLite)
   si se quiere robustez; token permanente de Meta (System User).
4. **Destino final: VPS con k3s** ([[decision-vps-en-vez-de-aws]], 2026-06-09 — AWS descartado):
   mismo set de manifiestos de `backend/k8s/`; imágenes vía **GHCR** (chau `imagePullPolicy: Never`);
   exposición por Cloudflare Named Tunnel o Traefik (incluido en k3s) + cert-manager; Postgres
   sigue en pod con PVC → **backups propios obligatorios** (CronJob `pg_dump` + copia fuera del VPS).

## Decisiones abiertas

- ¿Server casero como banco de pruebas previo, o directo al VPS? (misma mecánica k3s en ambos).
- ¿Subdominio único `wa.` para n8n, o exponer también el gateway/app por el dominio?
- ¿Named Tunnel para todo, o Traefik + cert-manager con puertos 80/443 abiertos en el VPS?
- ¿Proveedor de VPS y tamaño? (el stack actual pide ~6–8 GB RAM: 7 JVMs + Keycloak + 2 Postgres + n8n; ver § Footprint en el informe 360 — achicable con límites JVM o consolidando servicios).
