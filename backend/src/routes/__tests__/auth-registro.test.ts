import bcrypt from 'bcrypt'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

vi.mock('../../lib/prisma.js', () => ({ prisma: { usuario: { create: vi.fn() } } }))

import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { createApp } from '../../app.js'

const create = prisma.usuario.create as unknown as Mock
const valido = { nombre: 'María', email: 'Maria@Email.com', password: 'secreto123' }

describe('POST /api/auth/registro', () => {
  beforeEach(() => create.mockReset())

  it('crea el usuario, guarda hash bcrypt y no devuelve la contraseña', async () => {
    create.mockResolvedValueOnce({ id: 1, nombre: 'María', email: 'maria@email.com', rol: 'usuario' })
    const res = await request(createApp()).post('/api/auth/registro').send(valido)

    expect(res.status).toBe(201)
    expect(res.body).toEqual({ id: 1, nombre: 'María', email: 'maria@email.com', rol: 'usuario' })
    const { data } = create.mock.calls[0][0]
    expect(data.email).toBe('maria@email.com')
    expect(data.passwordHash).not.toBe(valido.password)
    expect(await bcrypt.compare(valido.password, data.passwordHash)).toBe(true)
  })

  it('rechaza contraseñas de menos de 8 caracteres', async () => {
    const res = await request(createApp()).post('/api/auth/registro').send({ ...valido, password: '1234567' })
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('PASSWORD_TOO_SHORT')
    expect(create).not.toHaveBeenCalled()
  })

  it('rechaza email inválido y nombre vacío', async () => {
    const app = createApp()
    expect((await request(app).post('/api/auth/registro').send({ ...valido, email: 'x' })).status).toBe(400)
    expect((await request(app).post('/api/auth/registro').send({ ...valido, nombre: ' ' })).status).toBe(400)
  })

  it('responde 409 si el email ya existe', async () => {
    create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'x' }),
    )
    const res = await request(createApp()).post('/api/auth/registro').send(valido)
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('EMAIL_TAKEN')
  })
})
