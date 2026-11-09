export interface IngredientRow {
  ingredienteId: number | null
  nombrePendiente: string | null
  cantidad: string | number
  unidad: string
  query: string
}

export function emptyIngredientRow(): IngredientRow {
  return { ingredienteId: null, nombrePendiente: null, cantidad: '', unidad: 'g', query: '' }
}
