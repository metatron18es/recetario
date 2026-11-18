import { mealTypeSchema, paginationSchema } from '@recetario/shared'
import { Router, type Response } from 'express'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { optionalUserId, requireAdmin, requireUserId, ROL_ADMIN } from '../lib/auth.js'
import { recipeKcal, UNITS } from '../lib/nutrition.js'
import { sendError, type ErrorCode } from '../lib/errors.js'
import { idParams, validate } from '../lib/validate.js'

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
  ...paginationSchema.shape,
  mine: z.enum(['true', 'false']).default('false'),
  // US-09: free text (recipe name or ingredient) + meal type, combinable.
  q: z.string().trim().max(100).optional(),
  mealType: mealTypeSchema.optional(),
})

// US-08: public paginated list. `mine=true` returns only the session user's recipes.
const listQuery = { schema: listSchema, fallback: 'INVALID_PAGINATION' as const, fields: { mealType: 'INVALID_MEAL_TYPE' as const } }

recipesRouter.get('/recipes', validate({ query: listQuery }), async (req, res) => {
  const { page, limit, mine, q, mealType } = req.query

  let where: Prisma.RecetaWhereInput = {}
  if (mine === 'true') {
    const usuarioId = optionalUserId(req)
    if (usuarioId === null) {
      sendError(res, 401, 'SIGN_IN_REQUIRED')
      return
    }
    where = { usuarioId }
  }
  if (mealType) where = { ...where, tipoComida: mealType }
  if (q) {
    const contains = { contains: q, mode: 'insensitive' as const }
    where = {
      ...where,
      OR: [{ nombre: contains }, { ingredientes: { some: { ingrediente: { nombre: contains } } } }],
    }
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
recipesRouter.get('/recipes/:id', validate({ params: idParams }), async (req, res) => {
  const id = Number(req.params.id)
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

const ingredientSchema = z.object({
  ingredientId: z.number().int().positive().optional(),
  // A user can propose a new ingredient: it stays pending until the admin validates it.
  proposed: z.object({ name: z.string().trim().min(1).max(80), kcalPer100g: z.number().int().min(0).max(1000) }).optional(),
  quantity: z.number().positive(),
  unit: z.string().refine((u) => UNITS.includes(u)),
})

const createSchema = z.object({
  name: z.string().trim().min(1, 'RECIPE_NAME_REQUIRED'),
  mealType: mealTypeSchema,
  prepTimeMin: z.number().int().positive(),
  description: z.string().default(''),
  ingredients: z
    .array(
      ingredientSchema.refine((i) => (i.ingredientId === undefined) !== (i.proposed === undefined)),
    )
    .min(1, 'INGREDIENTS_REQUIRED'),
  steps: z
    .array(z.string())
    .transform((steps) => steps.map((s) => s.trim()).filter(Boolean))
    .refine((steps) => steps.length > 0, 'STEPS_REQUIRED'),
})

const recipeBody = {
  schema: createSchema,
  fallback: 'INVALID_RECIPE_BODY' as const,
  fields: {
    mealType: 'INVALID_MEAL_TYPE' as const,
    prepTimeMin: 'INVALID_PREP_TIME' as const,
    'ingredients.*': 'INVALID_INGREDIENT' as const,
  },
}

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

// Resolves existing ingredients and creates the proposed ones (pending admin validation).
async function resolveIngredients(tx: Tx, items: z.infer<typeof ingredientSchema>[], usuarioId: number) {
  const rows: { ingredienteId: number; cantidad: number; unidad: string }[] = []
  for (const item of items) {
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
        (await tx.ingrediente.create({ data: { nombre, calorias100g: kcalPer100g, validado: false, propuestoPorId: usuarioId } }))
      ).id
    }
    rows.push({ ingredienteId, cantidad: item.quantity, unidad: item.unit })
  }
  if (new Set(rows.map((r) => r.ingredienteId)).size !== rows.length) throw new Error('DUPLICATE_INGREDIENT')
  return rows
}

function sendWriteError(res: Response, e: unknown, fallback: ErrorCode) {
  const code = e instanceof Error ? e.message : ''
  if (code === 'INGREDIENT_NOT_FOUND' || code === 'DUPLICATE_INGREDIENT') sendError(res, 400, code)
  else sendError(res, 500, fallback)
}

// US-05: any signed-in user creates a recipe; it is public and linked to its author.
recipesRouter.post('/recipes', validate({ body: recipeBody }), async (req, res) => {
  const usuarioId = requireUserId(req, res)
  if (usuarioId === null) return
  const { name, mealType, prepTimeMin, description, steps, ingredients: items } = req.body

  try {
    const created = await prisma.$transaction(async (tx) => {
      const rows = await resolveIngredients(tx, items, usuarioId)
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
    sendWriteError(res, e, 'RECIPE_CREATE_FAILED')
  }
})

// US-06: only the author or the admin edits a recipe; the whole recipe is replaced.
recipesRouter.put('/recipes/:id', validate({ params: idParams, body: recipeBody }), async (req, res) => {
  const usuarioId = requireUserId(req, res)
  if (usuarioId === null) return
  const id = Number(req.params.id)
  const { name, mealType, prepTimeMin, description, steps, ingredients: items } = req.body

  try {
    const current = await prisma.receta.findUnique({ where: { id }, select: { usuarioId: true } })
    if (!current) return sendError(res, 404, 'RECIPE_NOT_FOUND')
    if (current.usuarioId !== usuarioId) {
      const user = await prisma.usuario.findUnique({ where: { id: usuarioId }, select: { rol: true } })
      if (user?.rol !== ROL_ADMIN) return sendError(res, 403, 'NOT_RECIPE_OWNER')
    }
    const updated = await prisma.$transaction(async (tx) => {
      const rows = await resolveIngredients(tx, items, usuarioId)
      return tx.receta.update({
        where: { id },
        data: {
          nombre: name,
          tipoComida: mealType,
          tiempoPreparacionMin: prepTimeMin,
          descripcion: description,
          ingredientes: { deleteMany: {}, create: rows },
          pasos: { deleteMany: {}, create: steps.map((texto, i) => ({ orden: i + 1, texto })) },
        },
        include,
      })
    })
    res.json(toApi(updated))
  } catch (e) {
    sendWriteError(res, e, 'RECIPE_UPDATE_FAILED')
  }
})

// US-07: only the admin deletes. If calendars use the recipe, answer 409 with the usage count
// until the client repeats the call with ?force=true; the calendar cells are emptied (SetNull).
const deleteQuery = { schema: z.object({ force: z.string().optional() }).passthrough(), fallback: 'INVALID_ID' as const }

recipesRouter.delete('/recipes/:id', requireAdmin, validate({ params: idParams, query: deleteQuery }), async (req, res) => {
  const id = Number(req.params.id)
  try {
    if (!(await prisma.receta.findUnique({ where: { id }, select: { id: true } }))) {
      return sendError(res, 404, 'RECIPE_NOT_FOUND')
    }
    const usages = await prisma.entradaCalendario.count({ where: { recetaId: id } })
    if (usages > 0 && req.query.force !== 'true') return sendError(res, 409, 'RECIPE_IN_USE', { usages })
    await prisma.receta.delete({ where: { id } })
    res.status(204).end()
  } catch {
    sendError(res, 500, 'RECIPE_DELETE_FAILED')
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
