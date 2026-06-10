---
type: analysis
status: in-progress
created: 2026-06-02
updated: 2026-06-02
sources: [[future-features-wishlist]], [[account-service]], [[user-service]], [[concept-jwt-x-user-id]], [[concept-feign-resilience]]
---

# Carga de transacciones por audio/WhatsApp con IA

Implementación del ítem #3 de [[future-features-wishlist]] (carga por audio con IA). El usuario habla/escribe por WhatsApp lo que gastó; una IA arma la transacción y la registra en la cuenta vinculada a su número.

## 🔖 Estado al cierre (2026-06-07) — leer esto primero al retomar

**El flujo WhatsApp inbound funciona end-to-end con WhatsApp real** (texto y audio →
IA → confirmación → transacción persistida). Ver [[log]] entrada 2026-06-07.

- ✅ **Fase 0 + 1**: en `main`, testeadas e2e (commits `9a08d72`, `edfb183`).
- ✅ **Fase 2 (audio)**: testeada y commiteada (`68f9479`). STT ElevenLabs Scribe vía `/intake/audio`.
- ✅ **Fase 3 inbound**: n8n + cloudflared en el cluster + Workflow A activo, **probado con WhatsApp real**
  (`96d4f58`). Datos Meta y detalles en `backend/intake-service/README-whatsapp-n8n.md`.
- 🟡 **Fase 3 outbound (código por WhatsApp)**: `WhatsAppNotifier` codeado y commiteado (`82141f7`)
  pero **NO desplegado ni probado** — falta **Workflow B** en n8n y redeploy de user-service.
  Hoy el código de verificación se lee de los logs de user-service.

**Cosas a definir / pendientes (cosas con reloj o riesgo):**
| Pendiente | Detalle |
|---|---|
| Token permanente de Meta | el temporal **vence en 24 h** (System User token) |
| Workflow B + redeploy user-service | para que el alta de teléfono sea self-service por WhatsApp |
| HMAC del webhook | `X-Hub-Signature-256` no se valida (webhook público) — hardening |
| URL efímera | cloudflared Quick Tunnel cambia al reiniciar → re-pegar Callback en Meta. Fix: Named Tunnel + dominio ([[deployment-infra-plan]]) |
| Datos de test | 3 tx de prueba quedaron en `usuario@test.com` (id 1/2/3, EXPENSE Supermercado) |

**Bug Argentina del "9" (resuelto)**: WhatsApp manda `from` con 9 (`5493516421422`); la Cloud API
solo acepta enviar **sin** 9 (`543516421422`). El nodo `Extract` de n8n normaliza; ese formato es
el que se verifica en user-service.

**Infra futura**: dominio `myfinances.qzz.io` (Cloudflare) + notebook vieja con Ubuntu Server como
servidor casero. Plan en [[deployment-infra-plan]].

**Acciones pendientes de Tobías**: rotar credenciales expuestas en chats (PAT GitHub + key Anthropic
+ ahora también el **token de Meta** y la **key de ElevenLabs** que se pegaron); generar token
permanente de Meta; `git push` (35 commits ahead).

---

## Arquitectura fijada (decisiones del 2026-06-02)

Decididas con el usuario antes de codear:

| Decisión | Elección | Por qué |
|---|---|---|
| Orquestación | **Híbrida**: n8n como adaptador de WhatsApp + microservicio Spring con la lógica | n8n aísla la parte "sucia" (media de WhatsApp, reintentos); la lógica de dominio queda en Java versionado y testeable |
| Proveedor WhatsApp | **Meta WhatsApp Business Cloud API** (oficial) | Camino production-grade que va a AWS; webhooks nativos |
| STT | **ElevenLabs (Scribe)** | El usuario ya lo tiene; buena calidad en es-AR; no suma proveedor nuevo |
| Parsing texto→JSON | **Claude API** (modelo **Haiku 4.5** por defecto, configurable) | Extracción simple de alto volumen; baratísimo (~fracción de centavo/mensaje); structured outputs |
| Verificación de teléfono | **Código por WhatsApp** | Self-service y seguro; evita spoofing del remitente |
| Aislamiento | **Microservicio aparte** (`intake-service`, puerto 8086) | Si se cae, solo se cae esta feature; el bot conecta solo a este servicio |

> ⚠️ **Claude Pro ≠ Claude API.** El microservicio necesita una **cuenta de API de Anthropic** (console.anthropic.com) con su propia facturación pay-per-use, distinta de la suscripción Claude Pro (que no da acceso programático). La key se inyecta por env `ANTHROPIC_API_KEY` / Secret `intake-secrets`.

## Flujo end-to-end

```
WhatsApp (audio o texto) → n8n (baja audio, ElevenLabs STT, manda replies)
   → POST /api/v1/intake/text {phone, text} → intake-service
       1. user-service GET /by-phone/{phone} → userId (solo teléfonos verificados)
       2. account-service GET /categories (X-User-Id) → categorías del usuario
       3. Claude parsea texto → ParsedTransaction (structured output)
       4. guarda pendiente + responde "Registré X. ¿OK?"   (NEEDS_CONFIRMATION)
   → usuario responde "OK" → mismo endpoint → crea vía account-service POST /transactions (CREATED)
```

El `intake-service` **no pasa por el gateway** (n8n lo expone hacia afuera); internamente llama a account-service con el header `X-User-Id` resuelto desde el teléfono — mismo patrón de confianza que [[concept-jwt-x-user-id]]. La seguridad del webhook (HMAC de Meta) vive en n8n.

La confirmación es una **máquina de estados conversacional** con estado en memoria por teléfono (`PendingConfirmationStore`, TTL 10 min). "OK/dale/sí" confirma; "no/cancelar" descarta; cualquier otra cosa se reinterpreta como corrección (reparseo).

## Plan por fases

| Fase | Qué | Estado |
|---|---|---|
| **0 — vínculo teléfono↔usuario** | campo `phone`/`phone_verified` en `user-service`, verificación por código, endpoint interno `by-phone` | ✅ hecho + **testeado e2e** 2026-06-02 |
| **1 — intake-service core** | microservicio 8086, endpoint `/intake/text`, parsing Claude, Feign a user+account, confirmación, k8s | ✅ hecho + **testeado e2e** 2026-06-02 |
| **2 — STT ElevenLabs** | endpoint `/intake/audio`: recibe audio de WhatsApp → ElevenLabs Scribe → mismo pipeline | ✅ código hecho 2026-06-02 (compila); **testeable ya** con key ElevenLabs + audio, sin Meta |
| **3 — n8n + Meta webhook** | `WhatsAppNotifier` en user-service (manda el código vía webhook n8n, no-op si no configurado) + runbook Meta/n8n | 🟡 código + runbook hechos 2026-06-02; la config de n8n/Meta queda para cuando haya cuentas |

## Archivos clave

- **user-service** (Fase 0): `model/User.java` (+phone, phoneVerified, code, expiry), `repository/UserRepository` (findByPhoneAndPhoneVerifiedTrue), `service/UserService` (requestPhoneVerification, confirmPhoneVerification, findUserIdByPhone), `controller/UserController` (POST /phone/verify, /phone/confirm, GET /by-phone/{phone}), DTOs `PhoneVerification*`, `PhoneLookupResponseDTO`. Handler de `IllegalArgumentException`→400 agregado.
- **intake-service** (Fase 1, nuevo módulo `backend/intake-service/`): `IntakeController`, `service/{TransactionIntakeService, ClaudeParsingService, PendingConfirmationStore}`, `client/{UserServiceClient, AccountServiceClient}`, `model/ParsedTransaction` (record para structured output), `config/AnthropicConfig`, DTOs, exception handler. `k8s/intake-service.yaml` + `k8s/intake-secrets.yaml`. Agregado a `rebuild.sh` y `deploy-k8s.sh`.

## Deuda / decisiones de MVP a recordar

- **Código de verificación se loguea a INFO** (no se envía aún) — para probar Fase 0/1 sin WhatsApp, leerlo de los logs de user-service. En Fase 3 se manda por WhatsApp.
- **Fecha de la transacción**: no se parsea (siempre "ahora"). "ayer", "el lunes" es mejora futura.
- **Prompt caching**: el system prompt es < 4096 tokens, así que en Haiku **no cachea** (mínimo del modelo). El breakpoint está puesto igual (gratis si no cachea; ayuda si crece o se usa Sonnet/Opus).
- **Estado de confirmación en memoria**: se pierde si el pod reinicia (el usuario reenvía). Mover a Redis si se quieren réplicas.
- **Sin tests JUnit** en intake-service todavía; validado por compilación. Los JUnit de user-service están rotos pre-existing (ver [[bug-refresh-token-snake-case]] § Estado) — no es regresión de este trabajo.
- **Verificación**: ✅ testeado end-to-end en Minikube (2026-06-02). Flujo completo verde: verificación de teléfono (verify→confirm→by-phone), parseo de gasto e ingreso con Claude, confirmación "OK"→creación en account-service (tx id=1), y ramas NOT_LINKED / NOT_UNDERSTOOD / cancelación. Commiteado en rama `feat/whatsapp-ai-intake` (2 commits). Dos bugs encontrados y arreglados durante el test: (a) `phoneVerified` null por gotcha de Lombok `@Builder` → `@Builder.Default`; (b) circuit breaker de Feign convertía el 404 "no vinculado" en 500 → desactivado.

## Roadmap de continuación (orden acordado con Tobías, 2026-06-07)

Cómo retomar la prueba tras apagar Minikube: [[whatsapp-resume-runbook]].

1. **Workflow B — código de verificación por WhatsApp**. Armar el flujo n8n que recibe
   `{phone, message}` de user-service (`WhatsAppNotifier`, ya commiteado en `82141f7`) y lo manda
   por WhatsApp; redeployar user-service con la imagen nueva; setear `NOTIFICATIONS_WHATSAPP_WEBHOOK_URL`.
   Ojo: mandar a un número fuera de la ventana de 24 h exige un **template de Authentication** aprobado
   en Meta (texto libre solo sirve dentro de la ventana).
2. **Token permanente de Meta** (System User token con permiso `whatsapp_business_messaging`) para
   no depender del temporal de 24 h. Actualizar la credencial de n8n.
3. **Test de cero, extremo a extremo**: crear un **usuario nuevo** desde la app → asignarle el número
   de Tobías → pasar la verificación de teléfono (idealmente recibiendo el código por WhatsApp, ya con
   Workflow B) → cargar transacciones por texto y audio → verificar persistencia. (Hoy el test fue sobre
   `usuario@test.com`; esto valida el alta real de punta a punta.)
4. **Seguridad pendiente**: validar **HMAC `X-Hub-Signature-256`** del webhook de Meta en n8n; revisar
   exposición del intake-service (no pasa por gateway, confía en el teléfono); rotar credenciales pegadas
   en chats; cualquier otra cosa colgada.
5. **Server casero + dominio** ([[deployment-infra-plan]]): conseguir/armar la notebook vieja con Ubuntu
   Server, instalar k3s, desplegar ahí, **conectar con git, configurar SSH**, y apuntar `myfinances.qzz.io`
   (Cloudflare Named Tunnel a un subdominio estable). Paso intermedio antes de AWS.
