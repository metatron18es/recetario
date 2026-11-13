import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'
import { prisma } from './prisma.js'
import { sendError } from './errors.js'

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
    sendError(res, 401, 'NOT_AUTHENTICATED')
    return
  }
  try {
    const { sub } = jwt.verify(decodeURIComponent(token), process.env.JWT_SECRET!) as { sub: string }
    const usuario = await prisma.usuario.findUnique({ where: { id: Number(sub) }, select: { rol: true } })
    if (!usuario) {
      sendError(res, 401, 'NOT_AUTHENTICATED')
      return
    }
    if (usuario.rol !== ROL_ADMIN) {
      sendError(res, 403, 'ADMIN_REQUIRED')
      return
    }
    next()
  } catch {
    sendError(res, 401, 'INVALID_SESSION')
  }
}

// Id of the user in the JWT cookie, or null if there is no valid session. For public routes that vary by user.
export function optionalUserId(req: Request): number | null {
  const token = /(?:^|;\s*)token=([^;]+)/.exec(req.headers.cookie ?? '')?.[1]
  if (!token) return null
  try {
    const { sub } = jwt.verify(decodeURIComponent(token), process.env.JWT_SECRET!) as { sub: string }
    return Number(sub)
  } catch {
    return null
  }
}

// Id of the session user; sends 401 and returns null when there is no valid session.
export function requireUserId(req: Request, res: Response): number | null {
  const id = optionalUserId(req)
  if (id === null) sendError(res, 401, 'NOT_AUTHENTICATED')
  return id
}
