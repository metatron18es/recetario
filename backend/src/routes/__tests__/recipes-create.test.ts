import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const tx = vi.hoisted(() => ({
  ingrediente: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
  receta: { create: vi.fn() },
}))
const findMany = vi.hoisted(() => vi.fn())
vi.mock('../../lib/prisma.js', () => ({
  prisma: { $transaction: (fn: (t: typeof tx) => unknown) => fn(tx), ingrediente: { findMany } },
}))

import { createApp } from '../../app.js'

const cookie = () => `token=${jwt.sign({ sub: '7' }, 'test-secret')}`
const valid = {
  name: 'Bowl',
  mealType: 'Comida',
  prepTimeMin: 20,
  description: '',
  ingredients: [{ ingredientId: 1, quantity: 200, unit: 'g' }],
  steps: ['Cocer'],
}
const created = {
  id: 9,
  nombre: 'Bowl',
  tipoComida: 'Comida',
  tiempoPreparacionMin: 20,
  descripcion: '',
  usuario: { id: 7, nombre: 'Ana' },
  ingredientes: [{ ingredienteId: 1, cantidad: 200, unidad: 'g', ingrediente: { nombre: 'Quinoa', calorias100g: 120 } }],
  pasos: [{ orden: 1, texto: 'Cocer' }],
}

const post = (body: object, auth = true) => {
  const r = request(createApp()).post('/api/recipes')
  return (auth ? r.set('Cookie', cookie()) : r).send(body)
}

describe('POST /api/recipes', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret'
    tx.ingrediente.findUnique.mockReset().mockResolvedValue({ id: 1 })
    tx.ingrediente.findFirst.mockReset().mockResolvedValue(null)
    tx.ingrediente.create.mockReset().mockResolvedValue({ id: 50 })
    tx.receta.create.mockReset().mockResolvedValue(created)
  })

  it('requires a session', async () => {
    const res = await post(valid, false)
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('NOT_AUTHENTICATED')
  })

  it('creates the recipe linked to its author', async () => {
    const res = await post(valid)
    expect(res.status).toBe(201)
    expect(tx.receta.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ usuarioId: 7 }) }))
    expect(res.body).toMatchObject({ id: 9, kcal: 240, author: { id: 7 } })
  })

  it.each([
    ['RECIPE_NAME_REQUIRED', { name: '  ' }],
    ['INVALID_MEAL_TYPE', { mealType: 'Brunch' }],
    ['INVALID_PREP_TIME', { prepTimeMin: 0 }],
    ['INGREDIENTS_REQUIRED', { ingredients: [] }],
    ['STEPS_REQUIRED', { steps: [' '] }],
    ['INVALID_INGREDIENT', { ingredients: [{ ingredientId: 1, quantity: 0, unit: 'g' }] }],
    ['INVALID_INGREDIENT', { ingredients: [{ ingredientId: 1, quantity: 1, unit: 'xx' }] }],
  ])('400 %s', async (code, extra) => {
    const res = await post({ ...valid, ...extra })
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe(code)
    expect(tx.receta.create).not.toHaveBeenCalled()
  })

  it('proposes a new ingredient as pending validation', async () => {
    const res = await post({ ...valid, ingredients: [{ proposed: { name: 'Teff', kcalPer100g: 360 }, quantity: 50, unit: 'g' }] })
    expect(res.status).toBe(201)
    expect(tx.ingrediente.create).toHaveBeenCalledWith({
      data: { nombre: 'Teff', calorias100g: 360, validado: false, propuestoPorId: 7 },
    })
  })

  it('400 INGREDIENT_NOT_FOUND for an unknown id', async () => {
    tx.ingrediente.findUnique.mockResolvedValue(null)
    const res = await post(valid)
    expect(res.body.error.code).toBe('INGREDIENT_NOT_FOUND')
  })

  it('400 DUPLICATE_INGREDIENT', async () => {
    const dup = { ingredientId: 1, quantity: 1, unit: 'g' }
    const res = await post({ ...valid, ingredients: [dup, dup] })
    expect(res.body.error.code).toBe('DUPLICATE_INGREDIENT')
  })
})

describe('GET /api/ingredients', () => {
  it('lists validated plus own proposals', async () => {
    process.env.JWT_SECRET = 'test-secret'
    findMany.mockResolvedValue([{ id: 1, nombre: 'Quinoa', calorias100g: 120, dietaMinima: 'Vegana', validado: true }])
    const res = await request(createApp()).get('/api/ingredients').set('Cookie', cookie())
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { OR: [{ validado: true }, { propuestoPorId: 7 }] } }))
    expect(res.body[0]).toMatchObject({ id: 1, name: 'Quinoa', kcalPer100g: 120, validated: true })
  })
})
