import express from 'express'
import cors from 'cors'
import { healthRouter } from './routes/health.js'
import { authRouter } from './routes/auth.js'
import { recipesRouter } from './routes/recipes.js'

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
  app.use('/api', recipesRouter)

  return app
}

// Vercel ejecuta la app Express exportada por defecto como función serverless.
export default createApp()
