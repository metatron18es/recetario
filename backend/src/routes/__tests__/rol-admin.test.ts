import express from 'express'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const findUnique = vi.hoisted(() => vi.fn())
const create = vi.hoisted(() => vi.fn())
vi.mock('../../lib/prisma.js', () => ({ prisma: { usuario: { findUnique, create } } }))

import { requireAdmin } from '../../lib/auth.js'
import { createApp } from '../../app.js'

const appAdmin = () => {
  const app = express()
  app.get('/admin', requireAdmin, (_req, res) => res.json({ ok: true }))
  return app
}
const cookie = () => `token=${jwt.sign({ sub: '1', rol: 'admin' }, 'test-secret', { expiresIn: 60 })}`

describe('requireAdmin', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret'
    findUnique.mockReset()
  })

  it('401 sin cookie', async () => {
    expect((await request(appAdmin()).get('/admin')).status).toBe(401)
  })

  it('403 si el usuario no es admin, aunque el token diga lo contrario', async () => {
    findUnique.mockResolvedValue({ rol: 'usuario' })
    expect((await request(appAdmin()).get('/admin').set('Cookie', cookie())).status).toBe(403)
  })

  it('pasa si el usuario es admin', async () => {
    findUnique.mockResolvedValue({ rol: 'admin' })
    expect((await request(appAdmin()).get('/admin').set('Cookie', cookie())).status).toBe(200)
  })
})

describe('rol al registrarse', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAIL = 'Admin@x.com'
    create.mockReset()
    create.mockResolvedValue({ id: 1 })
  })
  const registrar = (email: string) =>
    request(createApp()).post('/api/auth/registro').send({ nombre: 'N', email, password: '12345678' })

  it('el email de ADMIN_EMAIL obtiene rol admin', async () => {
    await registrar('admin@x.com')
    expect(create.mock.calls[0][0].data.rol).toBe('admin')
  })

  it('cualquier otro email obtiene rol usuario', async () => {
    await registrar('otro@x.com')
    expect(create.mock.calls[0][0].data.rol).toBe('usuario')
  })
})
