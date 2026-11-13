import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const tx = vi.hoisted(() => ({
  ingrediente: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
  receta: { update: vi.fn() },
}))
const db = vi.hoisted(() => ({ receta: { findUnique: vi.fn() }, usuario: { findUnique: vi.fn() } }))
vi.mock('../../lib/prisma.js', () => ({
  prisma: { $transaction: (fn: (t: typeof tx) => unknown) => fn(tx), ...db },
}))

import { createApp } from '../../app.js'

const cookie = (sub = '7') => `token=${jwt.sign({ sub }, 'test-secret')}`
const valid = {
  name: 'Bowl 2',
  mealType: 'Cena',
  prepTimeMin: 15,
  description: '',
  ingredients: [{ ingredientId: 1, quantity: 100, unit: 'g' }],
  steps: ['Mezclar'],
}
const updated = {
  id: 9,
  nombre: 'Bowl 2',
  tipoComida: 'Cena',
  tiempoPreparacionMin: 15,
  descripcion: '',
  usuario: { id: 7, nombre: 'Ana' },
  ingredientes: [{ ingredienteId: 1, cantidad: 100, unidad: 'g', ingrediente: { nombre: 'Quinoa', calorias100g: 120 } }],
  pasos: [{ orden: 1, texto: 'Mezclar' }],
}
const put = (body: object, sub = '7', id = 9) => request(createApp()).put(`/api/recipes/${id}`).set('Cookie', cookie(sub)).send(body)

describe('PUT /api/recipes/:id', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret'
    db.receta.findUnique.mockReset().mockResolvedValue({ usuarioId: 7 })
    db.usuario.findUnique.mockReset().mockResolvedValue({ rol: 'usuario' })
    tx.ingrediente.findUnique.mockReset().mockResolvedValue({ id: 1 })
    tx.receta.update.mockReset().mockResolvedValue(updated)
  })

  it('requires a session', async () => {
    const res = await request(createApp()).put('/api/recipes/9').send(valid)
    expect(res.status).toBe(401)
  })

  it('lets the author edit', async () => {
    const res = await put(valid)
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Bowl 2')
    expect(tx.receta.update).toHaveBeenCalled()
  })

  it('lets the admin edit someone else\'s recipe', async () => {
    db.usuario.findUnique.mockResolvedValue({ rol: 'admin' })
    expect((await put(valid, '1')).status).toBe(200)
  })

  it('rejects other users with 403', async () => {
    const res = await put(valid, '2')
    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('NOT_RECIPE_OWNER')
    expect(tx.receta.update).not.toHaveBeenCalled()
  })

  it('returns 404 when the recipe does not exist', async () => {
    db.receta.findUnique.mockResolvedValue(null)
    expect((await put(valid)).body.error.code).toBe('RECIPE_NOT_FOUND')
  })

  it('validates the body', async () => {
    expect((await put({ ...valid, steps: [] })).body.error.code).toBe('STEPS_REQUIRED')
    expect((await put(valid, '7', 0)).body.error.code).toBe('INVALID_ID')
  })
})
