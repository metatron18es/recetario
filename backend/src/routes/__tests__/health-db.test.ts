import request from 'supertest'
import { describe, expect, it, vi, type Mock } from 'vitest'

vi.mock('../../lib/prisma.js', () => ({ prisma: { $queryRaw: vi.fn() } }))

import { prisma } from '../../lib/prisma.js'
import { createApp } from '../../app.js'

const queryRaw = prisma.$queryRaw as unknown as Mock

describe('GET /api/health/db', () => {
  it('responde ok si la base de datos contesta', async () => {
    queryRaw.mockResolvedValueOnce([{ '?column?': 1 }])
    const res = await request(createApp()).get('/api/health/db')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok', db: 'ok' })
  })

  it('responde 503 si no se puede conectar', async () => {
    queryRaw.mockRejectedValueOnce(new Error('sin conexión'))
    const res = await request(createApp()).get('/api/health/db')
    expect(res.status).toBe(503)
    expect(res.body).toEqual({ status: 'error', db: 'unreachable' })
  })
})
