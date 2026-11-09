// Los iconos son ficheros SVG en assets/icons (trazo, viewBox 24x24). El nombre del fichero es el nombre del icono:
// para añadir uno basta con dejar un .svg nuevo en esa carpeta.
const ficheros = import.meta.glob('../../assets/icons/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

export const ICONOS: Record<string, { body: string; stroke: string }> = Object.fromEntries(
  Object.entries(ficheros).map(([ruta, svg]) => [
    ruta.split('/').pop()!.replace('.svg', ''),
    { body: svg.replace(/<\/?svg[^>]*>/g, '').trim(), stroke: svg.match(/stroke-width="([\d.]+)"/)?.[1] ?? '1.6' },
  ]),
)

export const NOMBRES_ICONO = Object.keys(ICONOS)

/** Nombre de un fichero de assets/icons (sin `.svg`). */
export type NombreIcono = string
