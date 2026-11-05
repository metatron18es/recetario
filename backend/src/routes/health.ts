import { Router } from 'express'

export const healthRouter = Router()

// Comprobación mínima de que la API responde; sin tocar la base de datos
// todavía (fase de esqueleto, sin funcionalidad real).
healthRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'recetario-api' })
})
