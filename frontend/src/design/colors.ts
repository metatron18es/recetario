// La paleta se lee de assets/main.css: cada custom property de :root con un color opaco es un color disponible.
// Para añadir o quitar uno basta con editar el CSS; no hay lista que mantener aquí.
import css from '../assets/main.css?raw'

const raiz = css.match(/:root\s*\{([^}]*)\}/)?.[1] ?? ''

/** Nombres (sin `--`) de los colores opacos de la paleta. Se excluyen las sombras y el velo, que llevan transparencia. */
export const COLORES: string[] = [...raiz.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)]
  .filter(([, , valor]) => !/rgba|hsla/i.test(valor))
  .map(([, nombre]) => nombre)

/** Nombre de un color de la paleta (p. ej. `green-dark`). */
export type Color = string
