import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'
import { prisma } from './prisma.js'

export const ROL_ADMIN = 'admin'

// US-22: el administrador es la cuenta cuyo email coincide con ADMIN_EMAIL. Es único porque el email es único.
export function rolParaEmail(email: string): 'admin' | 'usuario' {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  return admin && admin === email ? ROL_ADMIN : 'usuario'
}

// Comprueba en el servidor que la cookie JWT es válida y que el usuario es admin en base de datos
// (no se fía del rol del token, que podría estar desactualizado).
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = /(?:^|;\s*)token=([^;]+)/.exec(req.headers.cookie ?? '')?.[1]
  if (!token) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }
  try {
    const { sub } = jwt.verify(decodeURIComponent(token), process.env.JWT_SECRET!) as { sub: string }
    const usuario = await prisma.usuario.findUnique({ where: { id: Number(sub) }, select: { rol: true } })
    if (!usuario) {
      res.status(401).json({ error: 'No autenticado' })
      return
    }
    if (usuario.rol !== ROL_ADMIN) {
      res.status(403).json({ error: 'Se requiere rol de administrador' })
      return
    }
    next()
  } catch {
    res.status(401).json({ error: 'Sesión no válida o expirada' })
  }
}
