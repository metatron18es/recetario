import { PrismaClient } from '@prisma/client'

// Instancia única del cliente Prisma para toda la app.
export const prisma = new PrismaClient()
