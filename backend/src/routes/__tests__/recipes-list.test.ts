import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const count = vi.hoisted(() => vi.fn())
const findMany = vi.hoisted(() => vi.fn())
const findUnique = vi.hoisted(() => vi.fn())
vi.mock('../../lib/prisma.js', () => ({ prisma: { receta: { count, findMany, findUnique } } }))

import { createApp } from '../../app.js'

const receta = (extra = {}) => ({
  id: 1,
  nombre: 'Bowl de quinoa',
  tipoComida: 'Comida',
  tiempoPreparacionMin: 20,
  descripcion: '',
  usuario: { id: 7, nombre: 'Ana' },
  ingredientes: [
    { ingredienteId: 1, cantidad: 200, unidad: 'g', ingrediente: { nombre: 'Quinoa', calorias100g: 120 } },
    { ingredienteId: 2, cantidad: 1, unidad: 'cda', ingrediente: { nombre: 'Aceite', calorias100g: 900 } },
  ],
  pasos: [{ orden: 1, texto: 'Cocer' }],
  ...extra,
})

describe('GET /api/recipes', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret'
    count.mockReset().mockResolvedValue(1)
    findMany.mockReset().mockResolvedValue([receta()])
    findUnique.mockReset()
  })

  it('combines text (name or ingredient) and meal type filters', async () => {
    const res = await request(createApp()).get('/api/recipes?q=quinoa&mealType=Comida')
    expect(res.status).toBe(200)
    const contains = { contains: 'quinoa', mode: 'insensitive' }
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tipoComida: 'Comida',
          OR: [{ nombre: contains }, { ingredientes: { some: { ingrediente: { nombre: contains } } } }],
        },
      }),
    )
  })

  it('rejects an unknown meal type', async () => {
    const res = await request(createApp()).get('/api/recipes?mealType=Brunch')
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_MEAL_TYPE')
  })

  it('public paginated list with computed kcal and author', async () => {
    const res = await request(createApp()).get('/api/recipes?page=2&limit=5')
    expect(res.status).toBe(200)
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: {}, skip: 5, take: 5 }))
    expect(res.body).toMatchObject({ total: 1, page: 2, limit: 5 })
    expect(res.body.recipes[0]).toMatchObject({ kcal: 375, author: { id: 7, name: 'Ana' } })
  })

  it('keeps recipes of a deleted author (author null)', async () => {
    findMany.mockResolvedValue([receta({ usuario: null })])
    const res = await request(createApp()).get('/api/recipes')
    expect(res.body.recipes[0].author).toBeNull()
  })

  it('400 on invalid pagination', async () => {
    expect((await request(createApp()).get('/api/recipes?page=0')).status).toBe(400)
  })

  it('mine=true requires a session', async () => {
    expect((await request(createApp()).get('/api/recipes?mine=true')).status).toBe(401)
  })

  it('mine=true filters by the session user', async () => {
    const token = jwt.sign({ sub: '7', rol: 'usuario' }, 'test-secret', { expiresIn: 60 })
    const res = await request(createApp()).get('/api/recipes?mine=true').set('Cookie', `token=${token}`)
    expect(res.status).toBe(200)
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { usuarioId: 7 } }))
  })
})

describe('GET /api/recipes/:id', () => {
  beforeEach(() => findUnique.mockReset())

  it('returns detail with ingredients and steps', async () => {
    findUnique.mockResolvedValue(receta())
    const res = await request(createApp()).get('/api/recipes/1')
    expect(res.status).toBe(200)
    expect(res.body.ingredients[0]).toEqual({ ingredientId: 1, name: 'Quinoa', quantity: 200, unit: 'g' })
    expect(res.body.steps).toEqual([{ text: 'Cocer' }])
  })

  it('404 if missing and 400 on invalid id', async () => {
    findUnique.mockResolvedValue(null)
    expect((await request(createApp()).get('/api/recipes/99')).status).toBe(404)
    expect((await request(createApp()).get('/api/recipes/abc')).status).toBe(400)
  })
})
