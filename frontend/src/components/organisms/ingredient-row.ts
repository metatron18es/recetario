export interface IngredientRow {
  ingredienteId: number | null
  nombrePendiente: string | null
  // kcal por 100 g del ingrediente propuesto (obligatorio para que el admin lo valide con datos).
  kcalPendiente: string | number
  cantidad: string | number
  unidad: string
  query: string
}

export function emptyIngredientRow(): IngredientRow {
  return { ingredienteId: null, nombrePendiente: null, kcalPendiente: '', cantidad: '', unidad: 'g', query: '' }
}
