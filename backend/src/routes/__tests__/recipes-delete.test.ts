import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const db = vi.hoisted(() => ({
  receta: { findUnique: vi.fn(), delete: vi.fn() },
  usuario: { findUnique: vi.fn() },
  entradaCalendario: { count: vi.fn() },
}))
vi.mock('../../lib/prisma.js', () => ({ prisma: db }))

import { createApp } from '../../app.js'

const cookie = (sub = '1') => `token=${jwt.sign({ sub }, 'test-secret')}`
const del = (url = '/api/recipes/9', sub = '1') => request(createApp()).delete(url).set('Cookie', cookie(sub))

describe('DELETE /api/recipes/:id', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret'
    db.usuario.findUnique.mockReset().mockResolvedValue({ rol: 'admin' })
    db.receta.findUnique.mockReset().mockResolvedValue({ id: 9 })
    db.receta.delete.mockReset().mockResolvedValue({})
    db.entradaCalendario.count.mockReset().mockResolvedValue(0)
  })

  it('requires a session', async () => {
    expect((await request(createApp()).delete('/api/recipes/9')).status).toBe(401)
  })

  it('forbids non-admins, even the author', async () => {
    db.usuario.findUnique.mockResolvedValue({ rol: 'usuario' })
    const res = await del()
    expect(res.status).toBe(403)
    expect(db.receta.delete).not.toHaveBeenCalled()
  })

  it('deletes an unused recipe', async () => {
    expect((await del()).status).toBe(204)
    expect(db.receta.delete).toHaveBeenCalledWith({ where: { id: 9 } })
  })

  it('returns 404 and 400', async () => {
    db.receta.findUnique.mockResolvedValue(null)
    expect((await del()).status).toBe(404)
    expect((await del('/api/recipes/x')).status).toBe(400)
  })

  it('warns with 409 when calendars use it, deletes with force', async () => {
    db.entradaCalendario.count.mockResolvedValue(3)
    const warn = await del()
    expect(warn.status).toBe(409)
    expect(warn.body.error).toMatchObject({ code: 'RECIPE_IN_USE', usages: 3 })
    expect(db.receta.delete).not.toHaveBeenCalled()
    expect((await del('/api/recipes/9?force=true')).status).toBe(204)
  })
})
