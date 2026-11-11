import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../lib/prisma.js', () => ({ prisma: { usuario: {} } }))

import { createApp } from '../../app.js'

describe('POST /api/auth/logout', () => {
  it('borra la cookie de sesión y responde 204', async () => {
    const res = await request(createApp()).post('/api/auth/logout').set('Cookie', 'token=abc')

    expect(res.status).toBe(204)
    const cookie = (res.headers['set-cookie'] as unknown as string[])[0]
    expect(cookie).toMatch(/^token=;/)
    expect(cookie).toMatch(/Expires=Thu, 01 Jan 1970/)
    expect(cookie).toMatch(/HttpOnly/)
  })

  it('es idempotente sin sesión previa', async () => {
    const res = await request(createApp()).post('/api/auth/logout')
    expect(res.status).toBe(204)
  })
})
