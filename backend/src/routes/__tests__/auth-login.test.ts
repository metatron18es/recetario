import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

vi.mock('../../lib/prisma.js', () => ({ prisma: { usuario: { findUnique: vi.fn() } } }))

import { prisma } from '../../lib/prisma.js'
import { createApp } from '../../app.js'

const findUnique = prisma.usuario.findUnique as unknown as Mock
let passwordHash: string

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret'
  passwordHash = await bcrypt.hash('secreto123', 4)
})

describe('POST /api/auth/login', () => {
  beforeEach(() => findUnique.mockReset())

  it('emite un JWT en cookie httpOnly y no devuelve el hash', async () => {
    findUnique.mockResolvedValueOnce({ id: 1, nombre: 'María', email: 'maria@email.com', rol: 'usuario', passwordHash })
    const res = await request(createApp()).post('/api/auth/login').send({ email: 'Maria@Email.com', password: 'secreto123' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ id: 1, nombre: 'María', email: 'maria@email.com', rol: 'usuario' })
    const cookie = (res.headers['set-cookie'] as unknown as string[])[0]
    expect(cookie).toMatch(/^token=/)
    expect(cookie).toMatch(/HttpOnly/)
    const token = cookie.split(';')[0].slice('token='.length)
    expect(jwt.verify(token, 'test-secret')).toMatchObject({ sub: '1', rol: 'usuario' })
  })

  it('responde 401 con el mismo mensaje si la contraseña es incorrecta o el email no existe', async () => {
    findUnique.mockResolvedValueOnce({ id: 1, email: 'maria@email.com', rol: 'usuario', passwordHash })
    const mala = await request(createApp()).post('/api/auth/login').send({ email: 'maria@email.com', password: 'otra' })
    findUnique.mockResolvedValueOnce(null)
    const noExiste = await request(createApp()).post('/api/auth/login').send({ email: 'x@email.com', password: 'secreto123' })

    expect(mala.status).toBe(401)
    expect(noExiste.status).toBe(401)
    expect(mala.body.error).toEqual(noExiste.body.error)
    expect(mala.body.error.code).toBe('CREDENTIALS_INVALID')
    expect(mala.headers['set-cookie']).toBeUndefined()
  })

  it('responde 401 si faltan campos', async () => {
    const res = await request(createApp()).post('/api/auth/login').send({})
    expect(res.status).toBe(401)
    expect(findUnique).not.toHaveBeenCalled()
  })
})
