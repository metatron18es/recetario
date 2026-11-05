import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

export const healthRouter = Router()

// Comprobación mínima de que la API responde; sin tocar la base de datos
// todavía (fase de esqueleto, sin funcionalidad real).
healthRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'recetario-api' })
})

// Comprueba de extremo a extremo la conexión con la base de datos (PostgreSQL en Neon).
healthRouter.get('/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', db: 'ok' })
  } catch {
    res.status(503).json({ status: 'error', db: 'unreachable' })
  }
})
