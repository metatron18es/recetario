import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { optionalUserId, requireUserId } from '../lib/auth.js'
import { recipeKcal, UNITS } from '../lib/nutrition.js'
import { sendError } from '../lib/errors.js'

export const recipesRouter = Router()

const include = {
  usuario: { select: { id: true, nombre: true } },
  ingredientes: { include: { ingrediente: true }, orderBy: { ingredienteId: 'asc' as const } },
  pasos: { orderBy: { orden: 'asc' as const } },
}

type RecipeRow = NonNullable<Awaited<ReturnType<typeof findRecipe>>>
const findRecipe = (id: number) => prisma.receta.findUnique({ where: { id }, include })

// Recipes are public. If the author deleted their account, `author` is null.
function toApi(r: RecipeRow) {
  return {
    id: r.id,
    name: r.nombre,
    mealType: r.tipoComida,
    prepTimeMin: r.tiempoPreparacionMin,
    description: r.descripcion,
    kcal: recipeKcal(r.ingredientes),
    author: r.usuario ? { id: r.usuario.id, name: r.usuario.nombre } : null,
    ingredients: r.ingredientes.map((i) => ({
      ingredientId: i.ingredienteId,
      name: i.ingrediente.nombre,
      quantity: i.cantidad,
      unit: i.unidad,
    })),
    steps: r.pasos.map((p) => ({ text: p.texto })),
  }
}

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  mine: z.enum(['true', 'false']).default('false'),
})

// US-08: public paginated list. `mine=true` returns only the session user's recipes.
recipesRouter.get('/recipes', async (req, res) => {
  const parsed = listSchema.safeParse(req.query)
  if (!parsed.success) {
    sendError(res, 400, 'INVALID_PAGINATION')
    return
  }
  const { page, limit, mine } = parsed.data

  let where = {}
  if (mine === 'true') {
    const usuarioId = optionalUserId(req)
    if (usuarioId === null) {
      sendError(res, 401, 'SIGN_IN_REQUIRED')
      return
    }
    where = { usuarioId }
  }

  try {
    const [total, rows] = await Promise.all([
      prisma.receta.count({ where }),
      prisma.receta.findMany({ where, include, orderBy: { id: 'asc' }, skip: (page - 1) * limit, take: limit }),
    ])
    res.json({ total, page, limit, recipes: rows.map(toApi) })
  } catch {
    sendError(res, 500, 'RECIPES_LOAD_FAILED')
  }
})

// US-08: public detail with ingredients, steps and kcal.
recipesRouter.get('/recipes/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) {
    sendError(res, 400, 'INVALID_ID')
    return
  }
  try {
    const recipe = await findRecipe(id)
    if (!recipe) {
      sendError(res, 404, 'RECIPE_NOT_FOUND')
      return
    }
    res.json(toApi(recipe))
  } catch {
    sendError(res, 500, 'RECIPE_LOAD_FAILED')
  }
})

const MEAL_TYPES = ['Desayuno', 'Almuerzo', 'Comida', 'Merienda', 'Cena']

const ingredientSchema = z.object({
  ingredientId: z.number().int().positive().optional(),
  // A user can propose a new ingredient: it stays pending until the admin validates it.
  proposed: z.object({ name: z.string().trim().min(1).max(80), kcalPer100g: z.number().int().min(0).max(1000) }).optional(),
  quantity: z.number().positive(),
  unit: z.string().refine((u) => UNITS.includes(u)),
})

const createSchema = z.object({
  name: z.string().trim().min(1),
  mealType: z.string(),
  prepTimeMin: z.number().int().positive(),
  description: z.string().default(''),
  ingredients: z.array(z.any()),
  steps: z.array(z.string()),
})

// US-05: any signed-in user creates a recipe; it is public and linked to its author.
recipesRouter.post('/recipes', async (req, res) => {
  const usuarioId = requireUserId(req, res)
  if (usuarioId === null) return

  const body = createSchema.safeParse(req.body)
  if (!body.success) {
    const field = body.error.issues[0]?.path[0]
    sendError(res, 400, field === 'name' ? 'RECIPE_NAME_REQUIRED' : field === 'prepTimeMin' ? 'INVALID_PREP_TIME' : 'INVALID_RECIPE_BODY')
    return
  }
  const { name, mealType, prepTimeMin, description } = body.data
  if (!MEAL_TYPES.includes(mealType)) return sendError(res, 400, 'INVALID_MEAL_TYPE')
  const steps = body.data.steps.map((s) => s.trim()).filter(Boolean)
  if (body.data.ingredients.length === 0) return sendError(res, 400, 'INGREDIENTS_REQUIRED')
  if (steps.length === 0) return sendError(res, 400, 'STEPS_REQUIRED')

  const items = z.array(ingredientSchema).safeParse(body.data.ingredients)
  if (!items.success || items.data.some((i) => (i.ingredientId === undefined) === (i.proposed === undefined))) {
    return sendError(res, 400, 'INVALID_INGREDIENT')
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const rows: { ingredienteId: number; cantidad: number; unidad: string }[] = []
      for (const item of items.data) {
        let ingredienteId = item.ingredientId
        if (ingredienteId !== undefined) {
          if (!(await tx.ingrediente.findUnique({ where: { id: ingredienteId }, select: { id: true } }))) {
            throw new Error('INGREDIENT_NOT_FOUND')
          }
        } else {
          const { name: nombre, kcalPer100g } = item.proposed!
          const existing = await tx.ingrediente.findFirst({ where: { nombre: { equals: nombre, mode: 'insensitive' } } })
          ingredienteId = (
            existing ??
            (await tx.ingrediente.create({
              data: { nombre, calorias100g: kcalPer100g, validado: false, propuestoPorId: usuarioId },
            }))
          ).id
        }
        rows.push({ ingredienteId, cantidad: item.quantity, unidad: item.unit })
      }
      if (new Set(rows.map((r) => r.ingredienteId)).size !== rows.length) throw new Error('DUPLICATE_INGREDIENT')

      return tx.receta.create({
        data: {
          usuarioId,
          nombre: name,
          tipoComida: mealType,
          tiempoPreparacionMin: prepTimeMin,
          descripcion: description,
          ingredientes: { create: rows },
          pasos: { create: steps.map((texto, i) => ({ orden: i + 1, texto })) },
        },
        include,
      })
    })
    res.status(201).json(toApi(created))
  } catch (e) {
    const code = e instanceof Error ? e.message : ''
    if (code === 'INGREDIENT_NOT_FOUND') sendError(res, 400, 'INGREDIENT_NOT_FOUND')
    else if (code === 'DUPLICATE_INGREDIENT') sendError(res, 400, 'DUPLICATE_INGREDIENT')
    else sendError(res, 500, 'RECIPE_CREATE_FAILED')
  }
})

// US-05: catalog for the recipe form: validated ingredients plus the ones the user proposed.
recipesRouter.get('/ingredients', async (req, res) => {
  const usuarioId = optionalUserId(req)
  try {
    const rows = await prisma.ingrediente.findMany({
      where: { OR: [{ validado: true }, ...(usuarioId === null ? [] : [{ propuestoPorId: usuarioId }])] },
      orderBy: { nombre: 'asc' },
    })
    res.json(
      rows.map((i) => ({
        id: i.id,
        name: i.nombre,
        kcalPer100g: i.calorias100g,
        minDiet: i.dietaMinima,
        validated: i.validado,
      })),
    )
  } catch {
    sendError(res, 500, 'INGREDIENTS_LOAD_FAILED')
  }
})
