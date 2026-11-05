import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../../app.js'

describe('GET /api/health', () => {
  it('responde con estado ok', async () => {
    const app = createApp()
    const res = await request(app).get('/api/health')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok', service: 'recetario-api' })
  })
})
