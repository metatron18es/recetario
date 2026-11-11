import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { rolParaEmail } from '../lib/auth.js'

export const authRouter = Router()

const registroSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  email: z.string().trim().toLowerCase().email('El email no es válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

// US-01: registro de usuario. El email es único y la contraseña se guarda con hash bcrypt.
authRouter.post('/auth/registro', async (req, res) => {
  const parsed = registroSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }
  const { nombre, email, password } = parsed.data

  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const usuario = await prisma.usuario.create({
      data: { nombre, email, passwordHash, rol: rolParaEmail(email) },
      select: { id: true, nombre: true, email: true, rol: true },
    })
    res.status(201).json(usuario)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      res.status(409).json({ error: 'Ya existe una cuenta con ese email' })
      return
    }
    res.status(500).json({ error: 'No se pudo crear la cuenta' })
  }
})

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
})

const CREDENCIALES_INVALIDAS = 'Email o contraseña incorrectos'
const SESION_MS = 7 * 24 * 60 * 60 * 1000

// Mismas opciones al emitir y al borrar la cookie, o el navegador no la elimina.
const cookieOpciones = () => ({
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
  secure: process.env.NODE_ENV === 'production',
})

// US-02: inicio de sesión. Emite un JWT en cookie httpOnly. El mensaje de error es el mismo
// para email inexistente y contraseña errónea, para no revelar qué cuentas existen.
authRouter.post('/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(401).json({ error: CREDENCIALES_INVALIDAS })
    return
  }
  const { email, password } = parsed.data

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    const ok = usuario ? await bcrypt.compare(password, usuario.passwordHash) : false
    if (!usuario || !ok) {
      res.status(401).json({ error: CREDENCIALES_INVALIDAS })
      return
    }
    const token = jwt.sign({ sub: String(usuario.id), rol: usuario.rol }, process.env.JWT_SECRET!, {
      expiresIn: SESION_MS / 1000,
    })
    res.cookie('token', token, { ...cookieOpciones(), maxAge: SESION_MS })
    res.json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol })
  } catch {
    res.status(500).json({ error: 'No se pudo iniciar sesión' })
  }
})

// US-03: cierre de sesión. Borra la cookie del JWT; es idempotente.
authRouter.post('/auth/logout', (_req, res) => {
  res.clearCookie('token', cookieOpciones())
  res.status(204).end()
})

// US-04: persistencia de sesión. Devuelve el usuario de la cookie JWT; 401 si falta, es inválida o expiró.
authRouter.get('/auth/me', async (req, res) => {
  const token = /(?:^|;\s*)token=([^;]+)/.exec(req.headers.cookie ?? '')?.[1]
  if (!token) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }
  try {
    const { sub } = jwt.verify(decodeURIComponent(token), process.env.JWT_SECRET!) as { sub: string }
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(sub) },
      select: { id: true, nombre: true, email: true, rol: true },
    })
    if (!usuario) {
      res.status(401).json({ error: 'No autenticado' })
      return
    }
    res.json(usuario)
  } catch {
    res.status(401).json({ error: 'Sesión no válida o expirada' })
  }
})
