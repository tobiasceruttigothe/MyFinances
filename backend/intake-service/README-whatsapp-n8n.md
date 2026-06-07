# Integración WhatsApp + n8n — runbook (Fase 3)

Guía para conectar WhatsApp (Meta Cloud API) con el `intake-service` usando **n8n** como adaptador. El microservicio ya está listo; esto es configuración de n8n + Meta + variables de entorno.

## ✅ Estado real al 2026-06-07 — LEER PRIMERO

El flujo **inbound funciona end-to-end** (probado con WhatsApp real): texto y audio →
IA → confirmación → transacción persistida en account-service. Lo concreto:

- **Meta**: app `My-finances` (tipo Business, modo prueba). En el UI nuevo de Meta la
  config es **por casos de uso** ("Conectarse con los clientes a través de WhatsApp"),
  no por "agregar producto". Datos de la app: número de prueba del bot `+1 555 677 3028`,
  **Phone Number ID `1092667377270926`**, **WABA ID `1483218953101834`**. Token de acceso
  **temporal (24 h)** — falta generar uno permanente (System User). Destinatario de prueba
  permitido: el número personal (hasta 5 sin verificación de empresa).
- **n8n**: desplegado **en el cluster** (`k8s/n8n.yaml`, imagen `n8nio/n8n`, PVC SQLite,
  `N8N_ENCRYPTION_KEY` en `n8n-secrets`). Expuesto con **cloudflared Quick Tunnel**
  (`k8s/cloudflared.yaml`) — URL `*.trycloudflare.com` efímera. Los workflows se versionan
  en `backend/n8n/workflows/` y se importan **por la API de n8n** (patrón infra-as-code).
- **Workflow A (inbound)** importado y activo: `whatsapp-inbound.json`. Webhook GET
  (verificación de Meta, eco del `hub.challenge`) + POST (mensajes). El token de Meta vive
  en una **credencial httpHeaderAuth** de n8n (no en el JSON del workflow).
- **Bug Argentina (resuelto)**: WhatsApp manda el `from` **con** el 9 (`549XXXXXXXXXX`),
  pero la Cloud API solo acepta **enviar** al número **sin** el 9 (`54XXXXXXXXXX`). El nodo
  `Extract` normaliza quitando el 9, y ese formato (`+54...` sin 9) es el que se verifica en
  user-service. Sin esto, el reply falla con `(#131030) Recipient phone number not in allowed list`.
- **Falta (cosas a definir)**:
  - **Workflow B** (enviar el código de verificación por WhatsApp) — **sin armar**. Hoy el
    código de verificación se lee de los logs de user-service. El `WhatsAppNotifier` de
    user-service está codeado pero **sin desplegar ni probar**.
  - **Token permanente de Meta** (el temporal vence en 24 h).
  - **HMAC** del webhook (`X-Hub-Signature-256`) — **no se valida** todavía (el webhook es
    público; ver § Seguridad / despliegue).
  - **Estado efímero**: si reinicia cloudflared cambia la URL → hay que re-configurar el
    Callback en Meta. Se resuelve con un **Named Tunnel + dominio propio** (ver § Despliegue).

## Arquitectura

```
WhatsApp ──(webhook)──► n8n ──HTTP──► intake-service ──Feign──► user-service / account-service
   ▲                     │
   └────(reply)──────────┘   (n8n manda la respuesta de vuelta por la Meta Send API)
```

n8n es el ÚNICO que tiene las credenciales de Meta. El `intake-service` solo expone HTTP interno; no habla con Meta. La seguridad del webhook (verificación + HMAC) vive en n8n.

## Variables / secrets a setear

**intake-service** (Secret `intake-secrets`):
```bash
kubectl create secret generic intake-secrets \
  --from-literal=anthropic-api-key='sk-ant-...' \
  --from-literal=elevenlabs-api-key='sk_...' \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl rollout restart deployment/intake-service
```

**user-service** (para que mande el código de verificación por WhatsApp vía n8n):
- Env `NOTIFICATIONS_WHATSAPP_WEBHOOK_URL` = URL del webhook de n8n del flujo B (abajo).
- Si queda vacío, el código solo se loguea (modo dev, sin WhatsApp).

**En n8n** (credenciales de Meta, NO van en el repo): `META_PHONE_NUMBER_ID`, `META_ACCESS_TOKEN` (permanente), `META_VERIFY_TOKEN` (string que vos elegís), `META_APP_SECRET` (para validar HMAC).

## Setup en Meta (developers.facebook.com)

1. Crear una app de tipo **Business** → agregar el producto **WhatsApp**.
2. Anotar el **Phone Number ID** y el **WABA ID**. Generar un **access token permanente** (System User token con permisos `whatsapp_business_messaging`).
3. **Webhook**: configurar la *Callback URL* (la URL pública de n8n del flujo A) y el *Verify Token* (= `META_VERIFY_TOKEN`). Suscribirse al campo **`messages`**.
4. **Template para el código**: para mandar un mensaje a alguien que NO te escribió en las últimas 24 h (caso del código de verificación), Meta exige un **template aprobado** (categoría *Authentication* u *Utility*). Crealo en el WhatsApp Manager y usalo en el flujo B. (Dentro de la ventana de 24 h sí se puede mandar texto libre.)

> Para desarrollo sin dominio público: exponé n8n con un túnel (`cloudflared tunnel --url http://localhost:5678`) y usá esa URL como Callback en Meta.

## Flujo A en n8n — inbound (WhatsApp → transacción)

1. **Webhook node** (GET + POST en la misma URL):
   - **GET** (verificación de Meta): responder `hub.challenge` si `hub.verify_token == META_VERIFY_TOKEN`.
   - **POST** (mensajes entrantes): validar el header `X-Hub-Signature-256` (HMAC-SHA256 del body con `META_APP_SECRET`).
2. **Extraer** del payload: `from` (teléfono del remitente, formato `549...` → normalizá a `+549...`), y el tipo (`messages[0].type`).
3. **Switch** por tipo:
   - **text**: `text.body` → `POST {INTAKE_URL}/api/v1/intake/text` con JSON `{"phone":"+549...","text":"<body>"}`.
   - **audio**: `audio.id` → `GET https://graph.facebook.com/v21.0/{audio.id}` (con `Authorization: Bearer META_ACCESS_TOKEN`) para obtener la `url` → descargar el binario de esa `url` (mismo Bearer) → `POST {INTAKE_URL}/api/v1/intake/audio` como **multipart/form-data** con `phone=+549...` y `file=<binario>`.
4. **Respuesta**: tomar `reply` del JSON que devuelve intake-service → `POST https://graph.facebook.com/v21.0/{META_PHONE_NUMBER_ID}/messages` (Bearer) con:
   ```json
   {"messaging_product":"whatsapp","to":"<from>","type":"text","text":{"body":"<reply>"}}
   ```

`INTAKE_URL` interno del cluster: `http://intake-service:8086` (si n8n corre en el mismo cluster) o vía port-forward/Ingress.

## Flujo B en n8n — outbound (código de verificación)

1. **Webhook node** (POST) — esta URL es la que va en `NOTIFICATIONS_WHATSAPP_WEBHOOK_URL` del user-service.
   - Recibe `{"phone":"+549...","message":"Tu código ... es: 123456 ..."}`.
2. **Meta Send** (`POST .../{phone_number_id}/messages`): mandar el **template** de autenticación con el código como parámetro (o texto libre si el usuario ya está en la ventana de 24 h).

## Cómo probar SIN Meta todavía

- **Fase 2 (audio) — testeable ya** con tu key de ElevenLabs y un audio de prueba:
  ```bash
  # (con ELEVENLABS_API_KEY seteado en el secret y el teléfono ya verificado)
  curl -F "phone=+5491133334444" -F "file=@gasto.ogg" \
       localhost:8086/api/v1/intake/audio
  ```
- **Verificación por WhatsApp**: dejá `NOTIFICATIONS_WHATSAPP_WEBHOOK_URL` sin setear → el código se loguea en user-service (como hasta ahora).
- **Flujo A completo**: se puede simular el webhook de Meta con un `curl` al webhook de n8n usando un payload de ejemplo de la doc de Meta, o probar el intake-service directo (`/intake/text`, `/intake/audio`) sin n8n.

## Contratos del intake-service (lo que n8n consume)

| Método | Endpoint | Body | Respuesta |
|---|---|---|---|
| POST | `/api/v1/intake/text` | `{phone, text}` (JSON) | `{status, reply, transactionId}` |
| POST | `/api/v1/intake/audio` | `phone` + `file` (multipart) | idem |

`status` ∈ `NOT_LINKED · NOT_UNDERSTOOD · NEEDS_CONFIRMATION · CREATED · CANCELLED · ERROR`. n8n solo necesita reenviar `reply` al usuario.

## Despliegue: hoy (dev) y futuro (servidor propio)

### Hoy — cloudflared Quick Tunnel (dev, sobre la notebook)
`k8s/cloudflared.yaml` corre un pod que abre un **Quick Tunnel** de Cloudflare hacia
`n8n:5678`. Cómo funciona y qué implica:

- cloudflared hace una conexión **saliente** a la red de Cloudflare y "tunelea" el tráfico
  de vuelta. **No abre ningún puerto en el router** — es más seguro que un port-forward del router.
- Cloudflare publica un host **público y aleatorio** `https://<random>.trycloudflare.com`
  que entra directo a n8n en la Minikube de la notebook. O sea: **sí, expone n8n a internet**
  mientras el pod corre. Protección actual: (a) login owner de n8n; (b) URL impredecible.
- El endpoint `/webhook/whatsapp` **tiene que** ser público (Meta lo llama). Riesgo: quien
  conozca la URL podría postear payloads falsos. Mitigación pendiente: **validar el HMAC
  `X-Hub-Signature-256`** de Meta en n8n (con el App Secret).
- **¿Apagarlo cuando no se prueba?** Sí. `kubectl scale deployment/cloudflared --replicas=0`
  (o `--replicas=1` para reactivar). Si se apaga la notebook / Minikube, el túnel muere solo.
  La URL cambia en cada reinicio → no sirve para algo estable.

### Futuro — dominio propio + servidor casero
Recursos que ya tiene Tobías: dominio **`myfinances.qzz.io`** (registrado/gestionado en
**Cloudflare**) + plan de usar una **notebook vieja con Ubuntu Server** como servidor de
proyectos. Camino recomendado:

1. **Ubuntu Server** en la notebook vieja + **k3s** (Kubernetes liviano, mejor que Minikube
   para algo que queda prendido) o Docker Compose si se quiere más simple. Migrar estos
   manifiestos (`k8s/`) a k3s es casi directo (cambia el storageClass del PVC).
2. **Cloudflare Named Tunnel** (en vez del Quick Tunnel): se crea en el dashboard de
   **Cloudflare Zero Trust**, da un **token** y se mapea un subdominio estable, p.ej.
   `wa.myfinances.qzz.io` → el `Service` de n8n. URL **fija**, HTTPS automático, sin abrir
   puertos. El Callback de Meta apunta a ese subdominio y **ya no cambia**.
   - cloudflared corre con `--token <token>` (reemplaza el `--url` del Quick Tunnel).
3. El Callback de Meta pasa a `https://wa.myfinances.qzz.io/webhook/whatsapp` (estable).
4. Más adelante: el mismo patrón se mueve a **AWS** (EKS + ALB/Ingress en vez del túnel),
   que es el objetivo final del proyecto.

> Mientras tanto, para una sesión de prueba puntual, el Quick Tunnel alcanza — solo recordar
> que la URL cambia y hay que re-pegarla en Meta.
