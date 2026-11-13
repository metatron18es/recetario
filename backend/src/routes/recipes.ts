import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { optionalUserId } from '../lib/auth.js'
import { recipeKcal } from '../lib/nutrition.js'
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
