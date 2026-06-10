# WIKI.md — Esquema y operación del wiki

Este archivo es el **manual de operación** del wiki para el agente LLM. Cualquier sesión nueva (Claude Code, Codex, OpenCode, etc.) debe leer este archivo antes de tocar el vault. Si no está claro qué hacer, este archivo manda; si este archivo está desactualizado, prefiere actualizarlo antes que improvisar.

> El usuario (Tobías) busca y aporta las fuentes. **Vos (LLM) escribís y mantenés el wiki**. Tobías casi nunca edita estas páginas a mano.

---

## 1. Propósito

Construir y mantener una **base de conocimiento persistente y evolutiva** sobre el proyecto **MyFinances** — un sistema de finanzas personales con backend de microservicios Spring Cloud sobre Kubernetes/Minikube, pensado como banco de pruebas para deployar en AWS.

El wiki es un intermediario entre Tobías y las fuentes (commits, código, docs, conversaciones, decisiones). No reemplaza al código; lo **compila en conocimiento navegable**: por qué se tomaron decisiones, cómo se relacionan los servicios, qué patrones se repiten, qué quedó pendiente, qué contradicciones existen entre lo escrito y lo implementado.

**Diferencia con RAG simple**: las síntesis, referencias cruzadas y contradicciones ya están escritas. Cada nueva fuente se integra (no solo se indexa). Una consulta lee páginas ya cocidas, no re-deriva conocimiento desde cero.

---

## 2. Estructura del vault

```
Vault-Myfinance/
├── WIKI.md            ← este archivo (esquema)
├── index.md           ← catálogo de contenido (por categoría)
├── log.md             ← registro cronológico append-only
├── overview.md        ← síntesis de alto nivel del proyecto
├── entities/          ← un archivo por entidad concreta (servicio, componente)
├── concepts/          ← patrones, mecanismos, ideas transversales
├── decisions/         ← ADRs (decisión + contexto + consecuencias)
├── sources/           ← resúmenes de fuentes (commit, doc, conversación, PR)
└── analyses/          ← respuestas-a-consulta archivadas (comparaciones, deep-dives)
```

**Regla de oro**: cada archivo tiene un propósito único. Si dudás dónde va algo, preguntate: ¿es **algo que existe** (entity), **una idea sobre cómo se hace algo** (concept), **una elección con alternativas descartadas** (decision), **material crudo de entrada** (source), o **una síntesis derivada bajo demanda** (analysis)?

---

## 3. Convenciones de las páginas

### 3.1 Nombres de archivo
- Kebab-case, sin acentos, sin espacios. Ej: `gateway-service.md`, `jwt-x-user-id.md`.
- Una entidad / concepto / decisión por archivo. Nada de páginas paraguas con seis temas.

### 3.2 Frontmatter mínimo
Toda página (excepto `WIKI.md`, `index.md`, `log.md`) lleva:

```yaml
---
type: entity | concept | decision | source | analysis
status: stable | draft | stale | superseded
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: [[source-foo]], [[source-bar]]   # de qué nace lo que afirma esta página
---
```

`status` debe reflejar la realidad: si una afirmación quedó desactualizada por una fuente nueva, marcala `stale` y crea o actualiza la página que la reemplaza.

### 3.3 Enlaces internos
- Usar siempre `[[wikilink]]` de Obsidian, sin extensión `.md`.
- Enlazar liberalmente. Un `[[concepto-que-no-existe-aún]]` es válido: marca un hueco para escribir después.
- Toda afirmación no trivial debe enlazar a su fuente (`[[source-commit-291c1db]]`, `[[source-claude-md]]`, etc.). Si no hay fuente, decir "**(sin fuente confirmada — verificar)**" explícitamente.

### 3.4 Citas y código
- Bloques de código con lenguaje. Snippets cortos, no archivos enteros.
- Rutas con `backend/account-service/src/main/java/.../TransactionService.java` cuando aplique. Si citás un símbolo, usá `archivo:línea`.

### 3.5 Tono
- Directo, sin paja. Lectura para ingeniero, no marketing.
- Español rioplatense (es el idioma del proyecto). Términos técnicos en inglés si así están en el código (gateway, fallback, scheduler).

---

## 4. Operaciones

### 4.1 Ingesta — `ingest <fuente>`

Cuando Tobías te indica que ingieras una nueva fuente (commit, archivo, conversación, artículo):

1. **Leer la fuente completa**. Si es un commit, mirar el diff entero y los archivos tocados. Si es una conversación, identificar las afirmaciones, decisiones y dudas.
2. **Discutir 3-5 puntos clave con Tobías** antes de escribir nada. Validar interpretación.
3. **Crear `sources/<slug>.md`** con: qué es la fuente, fecha, resumen, citas literales relevantes, qué cambia respecto al estado anterior.
4. **Actualizar las páginas afectadas** en `entities/`, `concepts/`, `decisions/`. Una fuente típica toca 5-15 páginas. Si una afirmación previa queda contradicha, marcarla `stale` y enlazar a la nueva.
5. **Actualizar `index.md`** si se crearon páginas nuevas.
6. **Agregar entrada a `log.md`** con el prefijo `## [YYYY-MM-DD] ingest | <título corto>`. Listar páginas tocadas.
7. **Reportar a Tobías** qué se tocó y qué no se entendió.

> **Default**: ingerir de a una fuente y mantener a Tobías en el loop. Solo procesar varias seguidas si él lo pide explícitamente.

### 4.2 Consulta — `ask <pregunta>`

1. Leer `index.md` para encontrar páginas candidatas.
2. Leer las páginas relevantes (entities, concepts, decisions). Si hace falta, ir a las `sources/` enlazadas.
3. Responder con citas internas (`[[página#sección]]`).
4. Si la respuesta es valiosa y reutilizable (comparación, análisis, conexión nueva), **ofrecer archivarla en `analyses/`**. Solo crearla si Tobías acepta o si la pregunta era explícitamente "agregá esto al wiki".
5. Si la pregunta revela un hueco (concepto sin página, contradicción, dato faltante), **proponerlo** y, si Tobías confirma, agregarlo al wiki o como TODO en la página huérfana.

### 4.3 Revisión — `review`

Pasada periódica de mantenimiento. Buscar:
- **Contradicciones** entre páginas (mismo hecho afirmado distinto en dos lugares).
- **Páginas stale**: afirmaciones obsoletas por commits nuevos. Verificar contra `git log` reciente.
- **Páginas huérfanas**: sin enlaces entrantes. Decidir si fusionar, eliminar o conectar.
- **Conceptos mencionados sin página propia** (texto plano que debería ser `[[wikilink]]`).
- **Referencias cruzadas faltantes**: si A menciona B y B no menciona A, agregar el back-link en B.
- **Lagunas**: cosas importantes del repo que no tienen entrada en el wiki.

Reportar hallazgos a Tobías antes de hacer cambios masivos. Loguear la revisión en `log.md`.

---

## 5. `index.md` y `log.md`

### `index.md` — catálogo de contenido
- Orientado a **qué hay** en el wiki.
- Una línea por página: `- [[slug]] — resumen de una línea (status)`.
- Organizado por categoría (overview, entities, concepts, decisions, sources, analyses).
- Actualizar **cada vez** que se crea, renombra o elimina una página.
- Debe ser el primer archivo que leés al responder una consulta.

### `log.md` — registro cronológico
- Orientado a **qué pasó y cuándo**.
- Append-only. No reescribir entradas pasadas (sí podés enlazar a una nueva que corrige).
- Prefijo obligatorio: `## [YYYY-MM-DD] <op> | <título>` donde `<op>` ∈ `{ingest, ask, review, schema}`.
- Permite `grep "^## \[" log.md | tail -10` para ver actividad reciente.
- Una entrada típica: 3-8 líneas con qué se hizo, qué páginas se tocaron, qué quedó pendiente.

---

## 6. Reglas duras

- **No inventar**. Si no está en una fuente, decirlo. Una afirmación sin fuente es una hipótesis, no conocimiento.
- **No reescribir las fuentes**. Las fuentes originales (commits, código, conversaciones) son inmutables. El wiki es derivado.
- **No borrar historia**. Si algo cambió, marcalo `superseded` y enlazá a la nueva versión. Borrar oculta el porqué.
- **No optimizar para volumen**. Una página que solo dice lo obvio del código no aporta. Eliminala o fusionala.
- **Verificar antes de aseverar** sobre estado actual. Recordá: el wiki puede estar desactualizado respecto al repo. Antes de responder algo crítico, mirá `git log` y el código.
- **English en código, español en prosa** (alineado con [[CLAUDE.md (repo)]] → "Use English for code comments").

---

## 7. Cómo evoluciona este archivo

Este `WIKI.md` no es sagrado. Si descubrís un flujo mejor, una convención que no escala, un tipo de página que falta — proponé el cambio a Tobías y actualizalo. Cada modificación al esquema va al `log.md` con prefijo `schema`.

El objetivo final: que cualquier agente LLM nuevo pueda leer este archivo y operar el wiki sin más contexto.
