import express, { Router, type ErrorRequestHandler, type RequestHandler } from 'express'
import { requireUserId } from '../lib/auth.js'
import { sendError } from '../lib/errors.js'
import { IMAGE_TYPES, imageUrl, matchesMime, MAX_IMAGE_BYTES, saveImage, type ImageMime } from '../lib/storage.js'

export const imagesRouter = Router()

// The raw body is the file itself (Content-Type image/jpeg|png|webp): no multipart dependency.
// Other types are not parsed, so the handler sees an empty body and the header decides the error.
const raw = express.raw({ type: Object.keys(IMAGE_TYPES), limit: MAX_IMAGE_BYTES })

const rawErrors: ErrorRequestHandler = (err, _req, res, next) => {
  if (err?.type === 'entity.too.large') return sendError(res, 413, 'IMAGE_TOO_LARGE')
  next(err)
}

// Returns the generated file name, which POST /recipes then references.
const needSession: RequestHandler = (req, res, next) => {
  if (requireUserId(req, res) !== null) next()
}

const upload: RequestHandler = async (req, res) => {
  const mime = req.headers['content-type']?.split(';')[0].trim() as ImageMime | undefined
  if (!mime || !(mime in IMAGE_TYPES) || !Buffer.isBuffer(req.body) || !matchesMime(req.body, mime)) {
    return sendError(res, 415, 'IMAGE_TYPE_NOT_ALLOWED')
  }
  try {
    const file = await saveImage(req.body, mime)
    res.status(201).json({ file, url: imageUrl(file) })
  } catch {
    sendError(res, 500, 'IMAGE_UPLOAD_FAILED')
  }
}

imagesRouter.post('/recipes/images', needSession, raw, rawErrors, upload)
