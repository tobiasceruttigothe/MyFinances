---
type: decision
status: stable
created: 2026-06-09
updated: 2026-06-09
sources: [[decision-identidad-cuaderno]], [[analisis-360-2026-06-09]]
---

# ADR — Identidad "Fini" (chanchito alcancía) reemplaza a Cuaderno

## Decisión

El frontend abandona la identidad **Cuaderno** (papel sepia, serif editorial, tono solemne)
y adopta la identidad **Fini**: una mascota — chanchito alcancía en SVG puro — con paleta
crema/rosa/coral, tipografías redondeadas (**Baloo 2** display + **Nunito** texto) y copy
divertido en voseo argentino. Supersede a [[decision-identidad-cuaderno]].

Decidido por Tobías el 2026-06-09: *"el diseño quedó demasiado profesional y elegante;
quiero algo divertido, práctico, fácil de usar, con un personaje que le dé identidad"*.

## Por qué un chanchito alcancía

- **My-FINances → "Fini"**: el nombre sale del nombre del producto.
- La **alcancía-chanchito** es el símbolo universal de guardar plata: comunica el propósito
  sin explicación, es amigable y se dibuja con primitivas SVG (sin assets externos).
- Alternativas evaluadas: carpincho "Capi" (juego con *capital*, meme argentino querible,
  pero no comunica finanzas por sí solo), vaquita ("hacer la vaquita", muy argentino pero
  ambiguo), hornero ahorrador (lindo, ilegible a tamaño chico).

## Cómo se implementó (clave técnica)

La arquitectura de tokens de Cuaderno hizo el retheme barato: **se mantienen los NOMBRES
de los tokens** (`paper/ink/rule/sepia/sage/wine/gold`, scope `data-mode="tinta"`, keyframes
`cuaderno-*`) **y cambian los valores** en `src/index.css` `@theme`. Todos los componentes
retiñen solos. `--font-serif` ahora apunta a Baloo 2, así cada `font-serif` existente se
vuelve display redondeada sin tocar JSX.

Piezas nuevas:
- `src/components/shared/Fini.tsx` — mascota SVG con moods (`happy/party/worried/sleepy/neutral`)
  + `FiniSays` (globo de diálogo para empty states e insights).
- Tokens `--color-pig`, `--color-pig-deep`, `--color-pig-soft`; animaciones `fini-bounce`/`fini-wiggle`.
- El dashboard usa a Fini como **indicador emocional del mes**: festeja si la tasa de ahorro
  ≥ 20 %, se preocupa si el balance es negativo, duerme si no hay datos.

## Consecuencias

- El scope `data-mode="tinta"` (Inversiones) pasa de azul tinta a **violeta noche** con
  acentos rosa/menta — sigue diferenciado pero dentro de la nueva voz.
- Los nombres de keyframes/`--animate-cuaderno-*` quedan como **nombres legados** (renombrarlos
  obligaría a tocar dialog.tsx/toast.tsx sin ganancia funcional).
- `chart-colors.ts` re-sincronizado con la paleta nueva (regla de oro: si cambian los tokens,
  sincronizar ese archivo a mano).
- El design handoff `frontend/design_handoff_my_finances/` y [[concept-sistema-cuaderno]]
  quedan como referencia histórica.
