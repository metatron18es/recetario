// Grams (or ml) per measuring unit. `ud`, `cda`, `cdta` and `pizca` are standard approximations:
// the schema does not store a weight per unit for each ingredient.
const GRAMS_PER_UNIT: Record<string, number> = {
  g: 1,
  kg: 1000,
  ml: 1,
  l: 1000,
  ud: 100,
  cda: 15,
  cdta: 5,
  pizca: 0.5,
}

// Recipe kcal = sum of calorias100g × grams / 100 for each ingredient (unknown unit counts as 0).
export function recipeKcal(
  items: { cantidad: number; unidad: string; ingrediente: { calorias100g: number } }[],
): number {
  const total = items.reduce(
    (sum, { cantidad, unidad, ingrediente }) =>
      sum + (ingrediente.calorias100g * cantidad * (GRAMS_PER_UNIT[unidad] ?? 0)) / 100,
    0,
  )
  return Math.round(total)
}
