import { MEAL_TYPES } from '@recetario/shared'
import { TipoComida } from '@prisma/client'
import { describe, expect, it } from 'vitest'

describe('TipoComida (Prisma) y MEAL_TYPES (shared)', () => {
  it('tienen los mismos valores y orden', () => {
    expect(Object.values(TipoComida)).toEqual([...MEAL_TYPES])
  })
})
