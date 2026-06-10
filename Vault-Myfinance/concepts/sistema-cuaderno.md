---
type: concept
status: stable
created: 2026-05-16
updated: 2026-05-16
sources: [[source-design-handoff-cuaderno]], [[source-handoff-readme]], [[source-design-system-html]]
---

# Sistema visual "Cuaderno"

Identidad visual del frontend de MyFinances. Introducido por el handoff de mayo 2026 ([[source-design-handoff-cuaderno]]).

## La tesis en una línea

> La app es un **cuaderno personal de cuentas**, no un dashboard tipo banca tradicional.

## Pilares

1. **Paleta Papel** como default. Fondo crema cálido (`#f4ecdd`), tinta marrón profunda (`#1a1612`), acentos sepia / sage / wine / gold. No azul corporativo.
2. **Paleta Tinta** solo para Inversiones. Azul oscuro Bloomberg-style. Es una sección, no un modo global. Ver [[concept-cuaderno-vs-tinta-mode]].
3. **Tipografía con roles claros**:
   - **Newsreader** (serif editorial) → títulos, números importantes, citas, ROI evaluativos.
   - **Hanken Grotesk** (sans humanista) → UI funcional, body, botones.
   - **JetBrains Mono** → fechas, montos crudos, tickers. Sensación de "ledger".
4. **Glifos editoriales** (`❧ ✦ ◐ ◯ ◇`) antes que emojis o íconos Lucide cuando se puede mantener el tono.

## Los 10 mandamientos (de [[source-handoff-readme]] § 7)

Estos son **irrenunciables** — si se pierden, el sistema se diluye a dashboard genérico.

1. **Inputs con borde inferior** (línea de cuaderno), no caja completa.
2. **Números importantes en serif** (Newsreader), no en sans. Balance, ROI, montos hero.
3. **ROI y porcentajes en serif italic** cuando son evaluativos (`+ 25.8%`).
4. **Fechas y montos crudos en mono** (JetBrains Mono).
5. **Item activo del sidebar con `❧`** (fleurón) e italic. No subrayado, no badge azul.
6. **Estado vacío** con frase en serif italic (`"La página de hoy está en blanco."`), no ícono triste.
7. **Toasts como tiras de papel** con borde-left de 4px, no rectángulos pastel.
8. **Confirmaciones destructivas** piden tipear `ELIMINAR` (fricción proporcional al daño).
9. **Categorías con glifos editoriales** antes que emoji.
10. **Balance principal NO es gradient azul** — es la paper card con número en serif gigante.

## Decisiones relacionadas

- [[decision-identidad-cuaderno]] — el porqué de adoptar este sistema en lugar de shadcn default.
- [[concept-cuaderno-vs-tinta-mode]] — el mecanismo del switch a la paleta Tinta.

## Implementación

- Tokens canónicos en `frontend/src/index.css` (sintaxis Tailwind v4 `@theme`).
- Manual visual completo en `frontend/design_handoff_my_finances/design-system.html` ([[source-design-system-html]]).
- Mockups de referencia para cada pantalla en `canvas/` ([[source-handoff-canvas]]).

## Tokens base de la paleta Papel

```
--color-paper:   #f4ecdd
--color-paper-2: #ede2cd
--color-ink:     #1a1612
--color-rule:    #c9bca0
--color-sepia:   #7c5a2a
--color-sage:    #5e7a4f
--color-wine:    #9a3a2e
--color-gold:    #d4a657
```

## Estado de aplicación

Paso 1 del plan de migración (tokens + fuentes) aplicado al 2026-05-16. Pasos 2-7 pendientes — ver [[source-design-handoff-cuaderno]] "Estado de implementación".
