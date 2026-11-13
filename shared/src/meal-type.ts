import { z } from 'zod'

export const MEAL_TYPES = ['Desayuno', 'Almuerzo', 'Comida', 'Merienda', 'Cena'] as const

export const mealTypeSchema = z.enum(MEAL_TYPES)

export type MealType = z.infer<typeof mealTypeSchema>
