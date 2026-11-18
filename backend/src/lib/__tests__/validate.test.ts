import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { validate } from '../validate.js'

const app = express()
app.use(express.json())
app.post(
  '/items/:id',
  validate({
    params: { schema: z.object({ id: z.string().regex(/^\d+$/) }), fallback: 'INVALID_ID' },
    query: { schema: z.object({ page: z.coerce.number().int().min(1).default(1) }), fallback: 'INVALID_PAGINATION', status: 422 },
    body: {
      schema: z.object({
        name: z.string().min(1, 'RECIPE_NAME_REQUIRED'),
        kind: z.enum(['a', 'b']),
        lines: z.array(z.object({ qty: z.number() })),
      }),
      fallback: 'INVALID_RECIPE_BODY',
      fields: { kind: 'INVALID_MEAL_TYPE', 'lines.*': 'INVALID_INGREDIENT' },
    },
  }),
  (req, res) => res.json({ query: req.query, body: req.body }),
)

const post = (url: string, body: unknown) => request(app).post(url).send(body as object)
const ok = { name: 'x', kind: 'a', lines: [] }

describe('validate', () => {
  it('replaces query and body with the parsed data', async () => {
    const res = await post('/items/3?page=2', ok)
    expect(res.status).toBe(200)
    expect(res.body.query).toEqual({ page: 2 })
  })

  it('uses the part status and fallback code', async () => {
    const res = await post('/items/3?page=0', ok)
    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('INVALID_PAGINATION')
  })

  it('maps params failures', async () => {
    expect((await post('/items/abc', ok)).body.error.code).toBe('INVALID_ID')
  })

  it('prefers an error code in the issue message', async () => {
    expect((await post('/items/3', { ...ok, name: '' })).body.error.code).toBe('RECIPE_NAME_REQUIRED')
  })

  it('maps fields declaratively, including array items', async () => {
    expect((await post('/items/3', { ...ok, kind: 'z' })).body.error.code).toBe('INVALID_MEAL_TYPE')
    expect((await post('/items/3', { ...ok, lines: [{ qty: 'x' }] })).body.error.code).toBe('INVALID_INGREDIENT')
  })

  it('falls back for anything else', async () => {
    const res = await post('/items/3', { ...ok, lines: 5 })
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_RECIPE_BODY')
  })
})
