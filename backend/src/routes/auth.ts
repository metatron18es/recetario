import bcrypt from 'bcrypt'
import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

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
      data: { nombre, email, passwordHash },
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
