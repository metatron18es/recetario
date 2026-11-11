import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const findUnique = vi.hoisted(() => vi.fn())
vi.mock('../../lib/prisma.js', () => ({ prisma: { usuario: { findUnique } } }))

import { createApp } from '../../app.js'

const usuario = { id: 1, nombre: 'Ana', email: 'ana@x.com', rol: 'USUARIO' }

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret'
    findUnique.mockReset()
  })

  it('devuelve el usuario con una cookie válida', async () => {
    findUnique.mockResolvedValue(usuario)
    const token = jwt.sign({ sub: '1', rol: 'USUARIO' }, 'test-secret', { expiresIn: 60 })
    const res = await request(createApp()).get('/api/auth/me').set('Cookie', `token=${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual(usuario)
  })

  it('401 sin cookie', async () => {
    const res = await request(createApp()).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('401 con token expirado', async () => {
    const token = jwt.sign({ sub: '1' }, 'test-secret', { expiresIn: -10 })
    const res = await request(createApp()).get('/api/auth/me').set('Cookie', `token=${token}`)
    expect(res.status).toBe(401)
  })

  it('401 si el usuario ya no existe', async () => {
    findUnique.mockResolvedValue(null)
    const token = jwt.sign({ sub: '9' }, 'test-secret', { expiresIn: 60 })
    const res = await request(createApp()).get('/api/auth/me').set('Cookie', `token=${token}`)
    expect(res.status).toBe(401)
  })
})
