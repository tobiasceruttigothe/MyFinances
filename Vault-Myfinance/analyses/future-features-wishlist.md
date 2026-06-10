---
type: analysis
status: stable
created: 2026-05-17
updated: 2026-05-17
sources: [[overview]], [[account-service]], [[frontend]]
---

# Wishlist · features futuras (a triage)

Ideas planteadas por Tobías al cierre de la sesión del 2026-05-17. **No están comprometidas** en un roadmap, son material para arrancar una conversación cuando se les quiera atacar. Ordenadas por complejidad creciente.

---

## 1 · Mostrar el NETO en alguna parte visible

**Disparador**: Tobías cargó una transacción positiva y una negativa después del deploy y "en ningún lado vio el neto" entre ambas.

**Estado actual** (verificable):
- `TransactionsPage` agrupa por día y, según el log del Paso 4 (commit `f62b90e`), muestra "neto del día en mono" al pie de cada bloque diario. Si Tobías cargó dos transacciones del mismo día, el neto del día debería estar visible — quizás está pero no salta a la vista, o quedó tipográficamente débil para destacarlo. **A verificar visualmente.**
- `DashboardPage` (`features/dashboard/DashboardPage.tsx`) tiene "stat row 3-celdas" en el header. Probablemente muestra balance total + ingresos del mes + gastos del mes, pero no necesariamente un "neto del mes" explícito.
- `ReportsPage` tiene KPI row 4-celdas + Recharts.

**Triage rápido sugerido cuando se ataque**:
1. Levantar `npm run dev`, cargar 2 transacciones (1 ingreso + 1 gasto), recorrer Dashboard / Transacciones / Reportes anotando dónde aparece o falta el neto.
2. Si el neto del día existe pero está tipográficamente perdido → reforzarlo (size + serif).
3. Si falta el neto del mes en Dashboard → agregarlo como cuarta celda del stat row o cambiar una de las existentes.
4. Considerar también: neto del período filtrado en `TransactionsPage` (cuando hay filtros activos).

**Esfuerzo estimado**: chico (1-2 h dependiendo de cuántos lugares haya que retocar). **Se puede atacar junto con la visual review pendiente** ([[next-steps-cuaderno-migration]] § Próximo · #5).

**Dependencias**: ninguna técnica. Requiere ojo humano en browser (Tobías).

---

## 2 · Gastos recurrentes con confirmación mensual (con consideración de inflación AR)

**Disparador**: gastos como seguro del auto, luz, gas son fijos pero **el monto varía mes a mes por inflación argentina**. Tobías quiere un sistema que el primero de cada mes le pregunte "¿registramos estos gastos?" y le permita ajustar montos (porque casi siempre subieron). Lo mismo para ingresos recurrentes (sueldo con aumento).

**Por qué no es trivial**: la complicación NO es el scheduler (eso es boilerplate, ya tenemos un patrón en `goals-service` con `GoalAutoContributionScheduler.java`). La complicación es **el flujo de confirmación + edición** — el usuario tiene que poder revisar la lista, ajustar montos individualmente, marcar "no este mes", y confirmar.

### Modelo propuesto (backend, `account-service`)

Nueva entidad `RecurringTransaction` (no `RecurringExpense` — el usuario también mencionó ingresos como sueldo):

```
- id: UUID
- userId: UUID
- description: String           (ej. "Seguro Maipú", "Sueldo")
- type: INCOME | EXPENSE
- categoryId: Long              (FK a category)
- baseAmount: BigDecimal        (último monto confirmado — sirve como sugerencia)
- dayOfMonth: int               (1-28; clip a 28 para evitar problemas con febrero)
- active: boolean
- lastConfirmedAt: LocalDate    (último mes que se procesó)
- notes: String?
```

Endpoints CRUD estándar + dos extras:
- `GET /api/v1/recurring-transactions/pending` — devuelve los recurring que tocan este mes y no fueron confirmados todavía.
- `POST /api/v1/recurring-transactions/{id}/confirm` con body `{ amount, date? }` — crea la transacción real y actualiza `lastConfirmedAt` + `baseAmount` (el monto ajustado pasa a ser la sugerencia del mes siguiente).

### Flujo de usuario (frontend)

- **Configuración**: nueva pestaña en `ProfilePage` o sección dedicada "Recurrentes" en el sidebar. Lista CRUD de los recurring con campos del modelo.
- **Trigger mensual**: cuando el usuario entra a la app y hay `pending`s, un **banner Cuaderno** en el Dashboard o un **Dialog modal** al iniciar sesión: "Tenés 4 gastos recurrentes pendientes de confirmar para mayo."
- **Pantalla de confirmación**: tabla editable con:
  - Descripción / categoría / día
  - Monto sugerido (= `baseAmount` del mes anterior) — **editable inline**
  - Botón individual "Confirmar" o "Saltar este mes"
  - Botón global "Confirmar todos con montos sugeridos"
- Se anotan en el ledger normal de transacciones con la fecha del día configurado (no la fecha de confirmación).

### Consideraciones de inflación

- **Simple (recomendado para v1)**: usar el último monto confirmado como sugerencia, sin estimar inflación. Si el seguro pasó de 30k a 33k el mes pasado, este mes se sugiere 33k — que el usuario ajuste si subió a 36k.
- **Avanzado (futuro)**: integrar con una fuente de inflación (INDEC, dolarapi.com con CPI, o un valor manual mensual configurado por el usuario) para sugerir un porcentaje automático sobre el `baseAmount`. **No iniciar acá**; es scope creep.

### Backend implications

- Migración Liquibase para crear la tabla.
- `RecurringTransactionService` con la lógica CRUD + `getPending(userId)` (filtra por `lastConfirmedAt < currentMonth` y `dayOfMonth <= today.day`).
- `RecurringTransactionScheduler` opcional — pero más simple es **pull-based**: cuando el frontend llama `getPending` ve qué falta. No hace falta cron job. Si se quiere notificación proactiva (push notification), el scheduler tiene sentido; sin ella, pull al login es suficiente.

### Dependencias

- Implementar primero el modelo + endpoints en `account-service`.
- Actualizar el Postman collection.
- Frontend: nueva ruta + nueva sección en sidebar (con item Cuaderno `❧`).
- Si se quiere el Dialog modal al iniciar sesión, integrarlo con el flujo de login post-`SessionRestorer`.

**Esfuerzo estimado**: medio-grande (1 semana de trabajo focused). Backend + frontend + Postman + Vault docs.

---

## 3 · Carga por audio con IA (chat embebido o WhatsApp)

**Disparador**: Tobías mencionó que después de una jornada de compras (verdulería 30k + carnicería 100k + ferretería X) es engorroso cargar transacción por transacción. Quiere mandar un audio describiendo todo y que la IA lo parsee y cargue.

**Status**: idea muy a futuro, "estaría increíble". No tocar todavía. Anotada acá para no perderla.

### Bocetos de arquitectura (cuando se vuelva a tocar)

**MVP — solo dentro de la web app, sin WhatsApp**:
1. Botón "Cargar por voz" en el Dashboard o como FAB.
2. Frontend: graba con `MediaRecorder` API, upload del blob al backend.
3. Nuevo microservicio `transcription-service` (o endpoint en un nuevo `ai-service`) que:
   - Recibe el audio.
   - Lo manda a un STT (OpenAI Whisper API, Google Speech-to-Text, o Whisper self-hosted en GPU local — Minikube no tiene GPU, escala mal).
   - El texto transcripto va al **Claude API** (ver memoria `claude-api` del usuario si se invoca el agent de Claude API) con un system prompt structured + tool use que devuelve JSON: `[{description, amount, type, suggestedCategoryId}, ...]`.
   - Devuelve la lista al frontend.
4. Frontend muestra un Dialog Cuaderno con preview de las transacciones detectadas → usuario confirma o ajusta → batch create al backend.

**WhatsApp integration (v2 muy futura)**:
- Requiere WhatsApp Business API, número business, webhook público (no funciona desde Minikube local — necesita la app deployada en AWS, lo cual coincide con el objetivo final del proyecto).
- El webhook recibe el audio del user, lo enruta al mismo `transcription-service`, y manda el preview de vuelta por WhatsApp para que el user confirme con un mensaje tipo "OK" o "ajustá la verdulería a 28000".
- Esto requiere conversación multi-turno con estado por user — más complejo. **No empezar por acá.**

### Consideraciones críticas

- **Matchear categorías existentes**: el LLM debe recibir la lista de categorías del usuario en el system prompt y elegir la que mejor matchea. Si nada matchea, sugerir crear una nueva (no hacerlo automáticamente).
- **Confirmación obligatoria**: NUNCA crear transacciones sin que el user las confirme visualmente. Un parseo mal interpretado puede dañar la integridad del cuaderno.
- **Multi-turno**: si el LLM no entiende algo del audio ("dije 'cinco mil' pero no estoy seguro si era pesos o algo más"), debería poder preguntar. Diseñar el preview Dialog para permitir editar inline.
- **Privacidad**: el audio se manda a un proveedor externo (OpenAI, Anthropic, Google). Si el user es sensible, ofrecer Whisper local o no implementar.
- **Costo**: Whisper API + Claude API tienen costo por minuto/token. Con prompt caching (memoria `claude-api` del user) se puede optimizar el system prompt + la lista de categorías que se manda en cada llamada.

### Dependencias

- Frontend con la migración Cuaderno cerrada ✅.
- Backend deployable en un lugar con webhook público para WhatsApp (requiere AWS deploy primero, ver [[overview]] § Objetivo).
- Una decisión sobre proveedores STT + LLM (probablemente Claude API ya que el user tiene affinity).
- Categorías bien curadas en el sistema (matching va a ser tan bueno como las categorías que existan).

**Esfuerzo estimado**: muy grande. Múltiples sprints. **No empezar hasta que (a) el sistema esté deployado en AWS y (b) los gastos recurrentes (#2) estén implementados — porque si el sistema no es usable día a día, el feature de voz no va a tener gente que lo use.**

---

## Notas operativas

- Cuando se quiera atacar **#1**, hacerlo junto con la visual review pendiente — caen en el mismo "ojo humano en browser" que ya está pendiente ([[next-steps-cuaderno-migration]] § Próximo).
- Cuando se quiera atacar **#2**, considerar agregar el scheduler junto con o reusando `GoalAutoContributionScheduler.java` como referencia. Ingerir su código al vault primero ([[concept-scheduling-goals]] sigue `draft`).
- **#3** está esperando el deploy en AWS — alineado con el objetivo declarado del proyecto ([[overview]] § Objetivo). Mientras tanto, no invertir tiempo.
