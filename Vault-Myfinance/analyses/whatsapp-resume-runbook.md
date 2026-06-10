---
type: analysis
status: stable
created: 2026-06-07
updated: 2026-06-10
sources: [[whatsapp-audio-intake]], [[deployment-infra-plan]], [[decision-vps-en-vez-de-aws]]
---

# Runbook — WhatsApp intake: estado actual y pendientes para "definitivo"

Al **2026-06-10** la feature de carga de transacciones por WhatsApp está **VIVA con número
real**: Tobías manda un gasto en lenguaje natural (texto o audio) al bot **Fini** y queda
registrado en su cuenta. Probado e2e: "Me compré un helado, me costó 5000" → confirmación → tx
`EXPENSE $5000 · Entretenimiento · Helado`. Este doc tiene (A) lo que ya está, (B) cómo retomar
tras apagar Minikube, y (C) **los 3 pendientes para dejarlo "definitivo", con pasos**.

## A. Estado actual (qué quedó funcionando)

- **Bot real**: número **Fini `+54 9 351 315 8241`** (display name "Fini", VERIFIED).
  - Phone Number ID: **`1203470332841891`** · WABA ID: **`973923875677110`** · App ID `1872563573439887`.
- **Exposición**: Cloudflare **Named Tunnel** → URL FIJA `https://wa.myfinances.qzz.io` → n8n.
  - El Callback de Meta es `https://wa.myfinances.qzz.io/webhook/whatsapp` y **ya no cambia**.
  - Token del tunnel en Secret `cloudflared-token`. cloudflared corre `tunnel run --token`.
- **Workflow A** (n8n id `yDuyWoBH6nqIA4LJ`) endurecido y activo: verify token (IF contra
  `$env.META_VERIFY_TOKEN`) + HMAC `X-Hub-Signature-256` (Code con `$env.META_APP_SECRET`,
  rawBody, fail-closed). Verificado con la firma real de Meta.
- **Secrets en el cluster** (cargados con `kubectl create secret`, NO en git):
  - `n8n-meta-secrets`: `META_VERIFY_TOKEN=<META_VERIFY_TOKEN — ver Secret n8n-meta-secrets en el cluster>`, `META_APP_SECRET`.
  - `cloudflared-token`: token del Named Tunnel.
  - `intake-secrets`: `anthropic-api-key` (real) + `elevenlabs-api-key` (real, scope STT).
- **n8n** (`k8s/n8n.yaml`) con env clave: `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`,
  `NODE_FUNCTION_ALLOW_BUILTIN=crypto`, `NODE_OPTIONS=--dns-result-order=ipv4first`,
  `WEBHOOK_URL=https://wa.myfinances.qzz.io/`.
- **Persistencia**: PVCs en postgres-db y keycloak-db → los datos sobreviven reinicios de Minikube.
- **Vínculo**: Tobías vinculó su WhatsApp personal **`+543516421422`** (sin el 9, ver bug AR) al
  usuario `usuario@test.com` / `Test@1234`.

### ⚠️ Regla de oro de los secrets
**Nunca** hacer `kubectl apply -f k8s/*-secrets.yaml` ni `deploy-k8s.sh` si eso aplica los
templates: pisan las keys reales con los placeholders `REEMPLAZAR_...`. Síntoma típico:
`401 invalid x-api-key` (Anthropic) o el HMAC en fail-open. Cargar siempre con `kubectl create
secret ... --dry-run=client -o yaml | kubectl apply -f -`.

## B. Retomar tras apagar Minikube

El estado de n8n (workflow, credencial del token, API key) y los Secrets persisten mientras NO
se haga `minikube delete`. Lo que puede haber cambiado: el **token de acceso de Meta** (si venció).

```bash
minikube start
kubectl get pods                     # esperar todo Running
# Named Tunnel: arranca solo y reconecta; la URL NO cambia. Verificar:
kubectl logs deploy/cloudflared | grep -i "registered tunnel"
# Port-forwards para operar/probar:
kubectl port-forward svc/gateway-service 8080:8080   # app/login
kubectl port-forward svc/n8n 5678:5678               # API de n8n para inspeccionar ejecuciones
```
Si Keycloak quedó sin realm (`relation "realm" does not exist` en sus logs porque arrancó antes
que su DB): `kubectl rollout restart deploy/keycloak`.

Probar: desde el WhatsApp personal `+543516421422`, mandar a Fini "gasté 1234 en X" → confirma →
"OK" crea la tx. Inspeccionar: `GET localhost:5678/api/v1/executions?workflowId=yDuyWoBH6nqIA4LJ`
con header `X-N8N-API-KEY`. Verificar tx: login gateway → `GET /api/v1/transactions/recent`.

## C. Pendientes para "definitivo" (próxima sesión)

### C.1 — Token permanente de Meta (System User)  ← URGENTE
El access token usado fue **temporal (vencía 2026-06-10 01:00)**. Si Fini deja de responder
(los nodos Get Media URL / Meta Send Reply fallan con 401), es esto.
1. **business.facebook.com** → Configuración del negocio → **Usuarios → Usuarios del sistema** →
   crear `myfinances-bot` (rol Admin) → **Agregar activos** → app `My-finances` (control total).
2. Vincular el número: Configuración del negocio → Cuentas → **Cuentas de WhatsApp** → la WABA
   `973923875677110` → agregar el system user con control total.
3. **Generar nuevo token**: app `My-finances`, **vencimiento Nunca**, permisos
   `whatsapp_business_messaging` + `whatsapp_business_management` → copiar (`EAA...`).
4. Verificar (opcional): `GET https://graph.facebook.com/debug_token?input_token=<T>&access_token=<T>`
   → `expires_at` debe ser `0`.
5. Actualizar en n8n (UI, pegar directo, NO en el chat): localhost:5678 → Credentials →
   "Meta WhatsApp Token" → header `Authorization` value = `Bearer <T>` → Save. (La API pública de
   n8n NO deja editar credenciales — su schema httpHeaderAuth rechaza el POST; hacerlo por UI.)

### C.2 — Workflow B: código de verificación por WhatsApp (self-service)
Hoy el código de verificación de teléfono **sale por los logs** de user-service
(`📱 Código de verificación ... : NNNNNN`), porque `WhatsAppNotifier` loguea en vez de enviar.
Para que llegue por WhatsApp:
1. **user-service** ya tiene `WhatsAppNotifier` (commit `82141f7`); falta setear el env
   `NOTIFICATIONS_WHATSAPP_WEBHOOK_URL` apuntando a un webhook de n8n y redeployar
   (`./rebuild.sh user-service` + `kubectl rollout restart deploy/user-service`).
2. **Workflow B en n8n**: un webhook nuevo (path propio, p.ej. `/webhook/send-code`) que reciba
   `{phone, message}` de user-service y haga el `POST graph.facebook.com/<PHONE_ID>/messages`
   con la credencial "Meta WhatsApp Token". Versionarlo en `backend/n8n/workflows/`.
3. **Ojo ventana de 24 h**: mandar a un número que NO escribió en las últimas 24 h exige un
   **template de Authentication aprobado** en Meta (texto libre solo dentro de la ventana). Para
   el código de verificación conviene crear ese template.
4. Probar: alta de teléfono desde el perfil → el código llega por WhatsApp (no por logs).

### C.3 — App de Meta a modo Live
Hoy la app está en **modo prueba**: solo manda/recibe de números allowlisted. Para abrirla a
cualquier usuario: Meta → la app → pasar a **Live** (puede requerir **Business Verification**:
documentación de la empresa). Para uso personal/pruebas el tier actual alcanza.

## D. Credenciales a ROTAR (todas se pegaron en chats — deuda de seguridad)
Verify token de Meta (quedó en la historia git — generar uno nuevo), Token del Named Tunnel (Cloudflare → Refresh token), App Secret de Meta, API key de n8n,
access token de Meta, `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY`. Rotar y recargar los Secrets
con `kubectl create secret`.

## Apagar
```bash
kubectl scale deployment/cloudflared --replicas=0   # cerrar exposición (opcional)
minikube stop
```
