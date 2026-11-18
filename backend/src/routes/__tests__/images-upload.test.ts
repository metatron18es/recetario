import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const save = vi.hoisted(() => vi.fn())
vi.mock('../../lib/prisma.js', () => ({ prisma: {} }))
vi.mock('../../lib/storage.js', async (orig) => ({ ...(await orig<typeof import('../../lib/storage.js')>()), saveImage: save }))

import { createApp } from '../../app.js'

const cookie = () => `token=${jwt.sign({ sub: '7' }, 'test-secret')}`
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0])

const upload = (type: string, body: Buffer, auth = true) => {
  const r = request(createApp()).post('/api/recipes/images').set('Content-Type', type)
  return (auth ? r.set('Cookie', cookie()) : r).send(body)
}

describe('POST /api/recipes/images', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret'
    save.mockReset().mockResolvedValue('11111111-1111-4111-8111-111111111111.png')
  })

  it('401 without a session', async () => {
    const res = await upload('image/png', png, false)
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('NOT_AUTHENTICATED')
    expect(save).not.toHaveBeenCalled()
  })

  it('stores a valid image and returns its file name and url', async () => {
    const res = await upload('image/png', png)
    expect(res.status).toBe(201)
    expect(save).toHaveBeenCalledWith(expect.any(Buffer), 'image/png')
    expect(res.body).toEqual({
      file: '11111111-1111-4111-8111-111111111111.png',
      url: '/uploads/11111111-1111-4111-8111-111111111111.png',
    })
  })

  it('415 IMAGE_TYPE_NOT_ALLOWED for other content types', async () => {
    const res = await upload('image/gif', Buffer.from('GIF89a'))
    expect(res.status).toBe(415)
    expect(res.body.error.code).toBe('IMAGE_TYPE_NOT_ALLOWED')
  })

  it('415 when the content does not match the declared type', async () => {
    const res = await upload('image/png', jpg)
    expect(res.status).toBe(415)
    expect(res.body.error.code).toBe('IMAGE_TYPE_NOT_ALLOWED')
    expect(save).not.toHaveBeenCalled()
  })

  it('413 IMAGE_TOO_LARGE over the size limit', async () => {
    const big = Buffer.concat([png, Buffer.alloc(5 * 1024 * 1024)])
    const res = await upload('image/png', big)
    expect(res.status).toBe(413)
    expect(res.body.error.code).toBe('IMAGE_TOO_LARGE')
  })
})
