// Catálogo inicial (alergias e ingredientes validados). Idempotente: se puede lanzar varias veces.
// En una base vacía los ids coinciden con los del prototipo del frontend (stores/recetario.ts).
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ALERGIAS = ['Gluten', 'Lactosa', 'Frutos secos', 'Huevo', 'Marisco', 'Soja', 'Pescado']

const INGREDIENTES: { nombre: string; kcal: number; dieta: string; alergias?: string[] }[] = [
  { nombre: 'Quinoa', kcal: 120, dieta: 'Vegana' },
  { nombre: 'Aguacate', kcal: 160, dieta: 'Vegana' },
  { nombre: 'Garbanzos cocidos', kcal: 164, dieta: 'Vegana' },
  { nombre: 'Tomate cherry', kcal: 18, dieta: 'Vegana' },
  { nombre: 'Lima', kcal: 30, dieta: 'Vegana' },
  { nombre: 'Aceite de oliva virgen extra', kcal: 884, dieta: 'Vegana' },
  { nombre: 'Huevo', kcal: 155, dieta: 'Vegetariana', alergias: ['Huevo'] },
  { nombre: 'Avena', kcal: 389, dieta: 'Vegana', alergias: ['Gluten'] },
  { nombre: 'Lentejas', kcal: 116, dieta: 'Vegana' },
  { nombre: 'Salmón', kcal: 208, dieta: 'Pescetariana', alergias: ['Pescado'] },
  { nombre: 'Pollo', kcal: 165, dieta: 'Omnívora' },
  { nombre: 'Hummus', kcal: 166, dieta: 'Vegana' },
]

async function main() {
  for (const nombre of ALERGIAS) await prisma.alergia.upsert({ where: { nombre }, update: {}, create: { nombre } })
  const alergias = new Map((await prisma.alergia.findMany()).map((a) => [a.nombre, a.id]))

  for (const { nombre, kcal, dieta, alergias: alergenos = [] } of INGREDIENTES) {
    const ing = await prisma.ingrediente.upsert({
      where: { nombre },
      update: {},
      create: { nombre, calorias100g: kcal, dietaMinima: dieta, validado: true },
    })
    for (const a of alergenos) {
      const alergiaId = alergias.get(a)!
      await prisma.ingredienteAlergia.upsert({
        where: { ingredienteId_alergiaId: { ingredienteId: ing.id, alergiaId } },
        update: {},
        create: { ingredienteId: ing.id, alergiaId },
      })
    }
  }
}

main().finally(() => prisma.$disconnect())
