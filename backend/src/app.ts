import express from 'express'
import cors from 'cors'
import { healthRouter } from './routes/health.js'
import { authRouter } from './routes/auth.js'
import { recipesRouter } from './routes/recipes.js'
import { imagesRouter } from './routes/images.js'
import { UPLOADS_DIR } from './lib/storage.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5174',
      credentials: true,
    }),
  )
  app.use(express.json())

  app.use('/api', healthRouter)
  app.use('/api', authRouter)
  // images before recipes: `/recipes/images` must not match `/recipes/:id`.
  app.use('/api', imagesRouter)
  app.use('/api', recipesRouter)
  app.use('/uploads', express.static(UPLOADS_DIR, { fallthrough: false }))

  return app
}

// Vercel ejecuta la app Express exportada por defecto como función serverless.
export default createApp()
