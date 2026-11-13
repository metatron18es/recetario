import { defineStore } from 'pinia'
import type { RecetaApi } from '../lib/api'
import imgBowlQuinoa from '../assets/recipes/bowl-quinoa.svg'
import imgTostadaAguacate from '../assets/recipes/tostada-aguacate.svg'
import imgCurryGarbanzos from '../assets/recipes/curry-garbanzos.svg'
import imgEnsaladaLentejas from '../assets/recipes/ensalada-lentejas.svg'
import imgPorridgeAvena from '../assets/recipes/porridge-avena.svg'
import imgSalmonVerduras from '../assets/recipes/salmon-verduras.svg'
import imgHummusCrudites from '../assets/recipes/hummus-crudites.svg'
import imgWrapPollo from '../assets/recipes/wrap-pollo.svg'
import imgPlaceholder from '../assets/recipes/placeholder.svg'

export type TipoComida = 'Desayuno' | 'Almuerzo' | 'Comida' | 'Merienda' | 'Cena'
export type TipoDieta = 'Vegana' | 'Vegetariana' | 'Pescetariana' | 'Omnívora'
export type DiaSemana = 'Lun' | 'Mar' | 'Mié' | 'Jue' | 'Vie' | 'Sáb' | 'Dom'

// Orden de menos a más permisiva; una dieta admite los ingredientes de las anteriores o iguales.
export const DIETAS: TipoDieta[] = ['Vegana', 'Vegetariana', 'Pescetariana', 'Omnívora']

export const IMAGEN_PLACEHOLDER = imgPlaceholder

// Unidades disponibles para las cantidades de ingredientes.
export const UNIDADES = [
  { valor: 'g', etiqueta: 'g' },
  { valor: 'kg', etiqueta: 'kg' },
  { valor: 'ml', etiqueta: 'ml' },
  { valor: 'l', etiqueta: 'l' },
  { valor: 'ud', etiqueta: 'unidad(es)' },
  { valor: 'cda', etiqueta: 'cucharada(s)' },
  { valor: 'cdta', etiqueta: 'cucharadita(s)' },
  { valor: 'pizca', etiqueta: 'pizca' },
] as const

export type Unidad = (typeof UNIDADES)[number]['valor']

export interface Alergia {
  id: number
  nombre: string
}

export interface Ingrediente {
  id: number
  nombre: string
  caloriasPor100g: number
  // Dieta más restrictiva que admite: la dieta de una receta es la más restrictiva de sus ingredientes.
  dietaMinima: TipoDieta
  // Ids de Alergia que provoca este ingrediente.
  alergenos?: number[]
}

export interface RecetaIngrediente {
  ingredienteId: number
  cantidad: number
  unidad: string
}

export interface PasoPreparacion {
  texto: string
  // Fotos opcionales del paso (data URLs); no son obligatorias.
  imagenes?: string[]
}

export interface Receta {
  id: number
  nombre: string
  tipoComida: TipoComida
  tiempoPreparacionMin: number
  descripcion: string
  kcal: number
  ingredientes: RecetaIngrediente[]
  pasos: PasoPreparacion[]
  gradiente: string
  imagenes: string[]
  // Autor según la API; las recetas de ejemplo no lo tienen.
  autorId?: number | null
}

export interface EntradaCalendario {
  diaSemana: DiaSemana
  tipoComida: TipoComida
  recetaId: number | null
}

export interface PreferenciaNutricional {
  tipoDieta: TipoDieta
  objetivoCaloricoDiario: number
}

const ALERGIAS: Alergia[] = [
  { id: 1, nombre: 'Gluten' },
  { id: 2, nombre: 'Lactosa' },
  { id: 3, nombre: 'Frutos secos' },
  { id: 4, nombre: 'Huevo' },
  { id: 5, nombre: 'Marisco' },
  { id: 6, nombre: 'Soja' },
  { id: 7, nombre: 'Pescado' },
]

const INGREDIENTES: Ingrediente[] = [
  { id: 1, nombre: 'Quinoa', caloriasPor100g: 120, dietaMinima: 'Vegana' },
  { id: 2, nombre: 'Aguacate', caloriasPor100g: 160, dietaMinima: 'Vegana' },
  { id: 3, nombre: 'Garbanzos cocidos', caloriasPor100g: 164, dietaMinima: 'Vegana' },
  { id: 4, nombre: 'Tomate cherry', caloriasPor100g: 18, dietaMinima: 'Vegana' },
  { id: 5, nombre: 'Lima', caloriasPor100g: 30, dietaMinima: 'Vegana' },
  { id: 6, nombre: 'Aceite de oliva virgen extra', caloriasPor100g: 884, dietaMinima: 'Vegana' },
  { id: 7, nombre: 'Huevo', caloriasPor100g: 155, dietaMinima: 'Vegetariana', alergenos: [4] },
  { id: 8, nombre: 'Avena', caloriasPor100g: 389, dietaMinima: 'Vegana', alergenos: [1] },
  { id: 9, nombre: 'Lentejas', caloriasPor100g: 116, dietaMinima: 'Vegana' },
  { id: 10, nombre: 'Salmón', caloriasPor100g: 208, dietaMinima: 'Pescetariana', alergenos: [7] },
  { id: 11, nombre: 'Pollo', caloriasPor100g: 165, dietaMinima: 'Omnívora' },
  { id: 12, nombre: 'Hummus', caloriasPor100g: 166, dietaMinima: 'Vegana' },
]

const RECETAS: Receta[] = [
  {
    id: 1,
    nombre: 'Bowl de quinoa y aguacate',
    tipoComida: 'Comida',
    tiempoPreparacionMin: 25,
    descripcion:
      'Un plato completo y fresco con quinoa, aguacate, garbanzos asados y una vinagreta de lima. Ajustado a tu objetivo calórico diario.',
    kcal: 480,
    ingredientes: [
      { ingredienteId: 1, cantidad: 180, unidad: 'g' },
      { ingredienteId: 2, cantidad: 1, unidad: 'ud' },
      { ingredienteId: 3, cantidad: 150, unidad: 'g' },
      { ingredienteId: 4, cantidad: 100, unidad: 'g' },
      { ingredienteId: 5, cantidad: 1, unidad: 'ud' },
      { ingredienteId: 6, cantidad: 15, unidad: 'ml' },
    ],
    pasos: [
      { texto: 'Cuece la quinoa en agua con sal durante 12 minutos y escurre.' },
      { texto: 'Asa los garbanzos con aceite y especias durante 15 minutos a 200°C.' },
      { texto: 'Corta el aguacate y los tomates cherry por la mitad.' },
      { texto: 'Monta el bowl y aliña con la vinagreta de lima.' },
    ],
    gradiente: 'linear-gradient(135deg,var(--terracotta-soft),var(--terracotta))',
    imagenes: [imgBowlQuinoa],
  },
  {
    id: 2,
    nombre: 'Tostada de aguacate y huevo',
    tipoComida: 'Desayuno',
    tiempoPreparacionMin: 10,
    descripcion: 'Tostada integral con aguacate machacado y huevo poché.',
    kcal: 320,
    ingredientes: [
      { ingredienteId: 2, cantidad: 1, unidad: 'ud' },
      { ingredienteId: 7, cantidad: 1, unidad: 'ud' },
    ],
    pasos: [
      { texto: 'Tuesta el pan integral.' },
      { texto: 'Machaca el aguacate con sal y limón.' },
      { texto: 'Escalfa el huevo 3 minutos.' },
      { texto: 'Monta la tostada con el aguacate y el huevo encima.' },
    ],
    gradiente: 'linear-gradient(135deg,var(--leaf),var(--green))',
    imagenes: [imgTostadaAguacate],
  },
  {
    id: 3,
    nombre: 'Curry de garbanzos',
    tipoComida: 'Cena',
    tiempoPreparacionMin: 35,
    descripcion: 'Curry suave de garbanzos con leche de coco y especias.',
    kcal: 410,
    ingredientes: [{ ingredienteId: 3, cantidad: 300, unidad: 'g' }],
    pasos: [
      { texto: 'Sofríe cebolla y ajo con especias de curry.' },
      { texto: 'Añade los garbanzos y la leche de coco.' },
      { texto: 'Cuece 20 minutos a fuego medio.' },
      { texto: 'Sirve con arroz o pan plano.' },
    ],
    gradiente: 'linear-gradient(135deg,var(--wheat),var(--terracotta))',
    imagenes: [imgCurryGarbanzos],
  },
  {
    id: 4,
    nombre: 'Ensalada de lentejas',
    tipoComida: 'Comida',
    tiempoPreparacionMin: 20,
    descripcion: 'Ensalada templada de lentejas con verduras de temporada.',
    kcal: 390,
    ingredientes: [{ ingredienteId: 9, cantidad: 200, unidad: 'g' }],
    pasos: [
      { texto: 'Cuece las lentejas.' },
      { texto: 'Trocea las verduras.' },
      { texto: 'Mezcla todo con aliño de mostaza y miel.' },
    ],
    gradiente: 'linear-gradient(135deg,var(--leaf-soft),var(--green-dark))',
    imagenes: [imgEnsaladaLentejas],
  },
  {
    id: 5,
    nombre: 'Porridge de avena y fruta',
    tipoComida: 'Desayuno',
    tiempoPreparacionMin: 8,
    descripcion: 'Porridge cremoso de avena con fruta fresca de temporada.',
    kcal: 280,
    ingredientes: [{ ingredienteId: 8, cantidad: 60, unidad: 'g' }],
    pasos: [
      { texto: 'Cuece la avena con leche o bebida vegetal.' },
      { texto: 'Añade fruta troceada por encima.' },
    ],
    gradiente: 'linear-gradient(135deg,var(--terracotta-soft),var(--wheat))',
    imagenes: [imgPorridgeAvena],
  },
  {
    id: 6,
    nombre: 'Salmón al horno con verduras',
    tipoComida: 'Cena',
    tiempoPreparacionMin: 30,
    descripcion: 'Lomo de salmón al horno con verduras asadas.',
    kcal: 520,
    ingredientes: [{ ingredienteId: 10, cantidad: 180, unidad: 'g' }],
    pasos: [
      { texto: 'Precalienta el horno a 200°C.' },
      { texto: 'Coloca el salmón y las verduras en la bandeja.' },
      { texto: 'Hornea 18-20 minutos.' },
    ],
    gradiente: 'linear-gradient(135deg,var(--terracotta),var(--green-dark))',
    imagenes: [imgSalmonVerduras],
  },
  {
    id: 7,
    nombre: 'Hummus con crudités',
    tipoComida: 'Merienda',
    tiempoPreparacionMin: 10,
    descripcion: 'Hummus casero con bastones de verdura fresca.',
    kcal: 180,
    ingredientes: [{ ingredienteId: 12, cantidad: 100, unidad: 'g' }],
    pasos: [
      { texto: 'Tritura garbanzos, tahini, limón y ajo.' },
      { texto: 'Sirve con bastones de zanahoria y pepino.' },
    ],
    gradiente: 'linear-gradient(135deg,var(--wheat),var(--sage))',
    imagenes: [imgHummusCrudites],
  },
  {
    id: 8,
    nombre: 'Wrap de pollo y verduras',
    tipoComida: 'Almuerzo',
    tiempoPreparacionMin: 15,
    descripcion: 'Wrap integral relleno de pollo a la plancha y verduras crujientes.',
    kcal: 450,
    ingredientes: [{ ingredienteId: 11, cantidad: 150, unidad: 'g' }],
    pasos: [
      { texto: 'Cocina el pollo a la plancha.' },
      { texto: 'Trocea las verduras.' },
      { texto: 'Enrolla todo en la tortilla integral.' },
    ],
    gradiente: 'linear-gradient(135deg,var(--terracotta-soft),var(--sage))',
    imagenes: [imgWrapPollo],
  },
]

const DIAS: DiaSemana[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MOMENTOS: TipoComida[] = ['Desayuno', 'Almuerzo', 'Comida', 'Merienda', 'Cena']

function seedCalendario(): EntradaCalendario[] {
  const porMomento: Record<TipoComida, number[]> = {
    Desayuno: RECETAS.filter((r) => r.tipoComida === 'Desayuno').map((r) => r.id),
    Almuerzo: RECETAS.filter((r) => r.tipoComida === 'Almuerzo').map((r) => r.id),
    Comida: RECETAS.filter((r) => r.tipoComida === 'Comida').map((r) => r.id),
    Merienda: RECETAS.filter((r) => r.tipoComida === 'Merienda').map((r) => r.id),
    Cena: RECETAS.filter((r) => r.tipoComida === 'Cena').map((r) => r.id),
  }
  const entradas: EntradaCalendario[] = []
  DIAS.forEach((dia, di) => {
    MOMENTOS.forEach((momento, mi) => {
      const vacio = (di + mi) % 5 === 0
      const opciones = porMomento[momento]
      const recetaId = vacio || opciones.length === 0 ? null : opciones[(di + mi) % opciones.length]
      entradas.push({ diaSemana: dia, tipoComida: momento, recetaId })
    })
  })
  return entradas
}

export const useRecetarioStore = defineStore('recetario', {
  state: () => ({
    usuario: { id: 1, nombre: 'María López', email: 'maria.lopez@email.com' },
    preferencia: { tipoDieta: 'Vegana', objetivoCaloricoDiario: 2000 } as PreferenciaNutricional,
    alergiasDisponibles: ALERGIAS,
    alergiasUsuario: [3] as number[], // Frutos secos
    ingredientes: INGREDIENTES,
    recetas: RECETAS,
    dias: DIAS,
    momentos: MOMENTOS,
    calendario: seedCalendario() as EntradaCalendario[],
    comprados: new Set<number>(), // ids de ingrediente marcados como comprados
  }),
  getters: {
    recetaPorId: (state) => (id: number) => state.recetas.find((r) => r.id === id),
    ingredientePorId: (state) => (id: number) => state.ingredientes.find((i) => i.id === id),
    // Dieta de una receta = la más restrictiva de sus ingredientes.
    dietaDeReceta: (state) => (receta: Receta): TipoDieta => {
      let max = 0
      for (const ri of receta.ingredientes) {
        const ing = state.ingredientes.find((i) => i.id === ri.ingredienteId)
        if (ing) max = Math.max(max, DIETAS.indexOf(ing.dietaMinima))
      }
      return DIETAS[max]
    },
    // Ids de alergia presentes en los ingredientes de una receta.
    alergenosDeReceta: (state) => (receta: Receta): number[] => {
      const ids = new Set<number>()
      for (const ri of receta.ingredientes) {
        state.ingredientes.find((i) => i.id === ri.ingredienteId)?.alergenos?.forEach((a) => ids.add(a))
      }
      return [...ids]
    },
    tieneAlergia: (state) => (alergiaId: number) => state.alergiasUsuario.includes(alergiaId),
    // La lista de la compra no es una entidad persistida: se deriva del calendario + RecetaIngrediente.
    listaDeLaCompra(state): { ingrediente: Ingrediente; cantidad: number; unidad: string }[] {
      const totales = new Map<number, { cantidad: number; unidad: string }>()
      for (const entrada of state.calendario) {
        if (!entrada.recetaId) continue
        const receta = state.recetas.find((r) => r.id === entrada.recetaId)
        if (!receta) continue
        for (const ri of receta.ingredientes) {
          const actual = totales.get(ri.ingredienteId)
          if (actual && actual.unidad === ri.unidad) {
            actual.cantidad += ri.cantidad
          } else {
            totales.set(ri.ingredienteId, { cantidad: ri.cantidad, unidad: ri.unidad })
          }
        }
      }
      return Array.from(totales.entries())
        .map(([ingredienteId, { cantidad, unidad }]) => ({
          ingrediente: state.ingredientes.find((i) => i.id === ingredienteId)!,
          cantidad,
          unidad,
        }))
        .filter((item) => item.ingrediente)
    },
  },
  actions: {
    toggleAlergia(alergiaId: number) {
      const idx = this.alergiasUsuario.indexOf(alergiaId)
      if (idx === -1) this.alergiasUsuario.push(alergiaId)
      else this.alergiasUsuario.splice(idx, 1)
    },
    toggleComprado(ingredienteId: number) {
      if (this.comprados.has(ingredienteId)) this.comprados.delete(ingredienteId)
      else this.comprados.add(ingredienteId)
    },
    asignarReceta(dia: DiaSemana, tipoComida: TipoComida, recetaId: number | null) {
      const entrada = this.calendario.find((e) => e.diaSemana === dia && e.tipoComida === tipoComida)
      if (entrada) entrada.recetaId = recetaId
    },
    // US-05: mezcla el catálogo de la API con el del prototipo (mismos ids en una base con el seed).
    cargarCatalogo(lista: { id: number; name: string; kcalPer100g: number; minDiet: string }[]) {
      for (const i of lista) {
        const nuevo = { nombre: i.name, caloriasPor100g: i.kcalPer100g, dietaMinima: i.minDiet as TipoDieta }
        const actual = this.ingredientes.find((x) => x.id === i.id)
        if (actual) Object.assign(actual, nuevo)
        else this.ingredientes.push({ id: i.id, ...nuevo })
      }
    },
    // US-05: guarda en el store la receta que ha creado la API (para verla en lista y detalle).
    anadirRecetaApi(r: RecetaApi, datos: { imagenes: string[]; pasos: PasoPreparacion[] }) {
      this.recetas.push({
        id: r.id,
        nombre: r.name,
        tipoComida: r.mealType as TipoComida,
        tiempoPreparacionMin: r.prepTimeMin,
        descripcion: r.description,
        kcal: r.kcal,
        ingredientes: r.ingredients.map((i) => ({ ingredienteId: i.ingredientId, cantidad: i.quantity, unidad: i.unit })),
        pasos: r.steps.map((p, i) => ({ texto: p.text, ...(datos.pasos[i]?.imagenes?.length ? { imagenes: datos.pasos[i].imagenes } : {}) })),
        gradiente: 'linear-gradient(135deg,var(--leaf),var(--green))',
        imagenes: datos.imagenes,
        autorId: r.author?.id ?? null,
      })
    },
    // US-06: refleja en el store la receta que ha devuelto la API tras editarla.
    actualizarRecetaApi(r: RecetaApi, datos: { imagenes: string[]; pasos: PasoPreparacion[] }) {
      const actual = this.recetas.find((x) => x.id === r.id)
      if (!actual) return
      Object.assign(actual, {
        nombre: r.name,
        tipoComida: r.mealType as TipoComida,
        tiempoPreparacionMin: r.prepTimeMin,
        descripcion: r.description,
        kcal: r.kcal,
        ingredientes: r.ingredients.map((i) => ({ ingredienteId: i.ingredientId, cantidad: i.quantity, unidad: i.unit })),
        pasos: r.steps.map((p, i) => ({ texto: p.text, ...(datos.pasos[i]?.imagenes?.length ? { imagenes: datos.pasos[i].imagenes } : {}) })),
        imagenes: datos.imagenes,
      })
    },
    anadirReceta(receta: Omit<Receta, 'id'>) {
      const id = Math.max(...this.recetas.map((r) => r.id)) + 1
      this.recetas.push({ ...receta, id })
      return id
    },
    actualizarReceta(id: number, cambios: Omit<Receta, 'id'>) {
      const index = this.recetas.findIndex((r) => r.id === id)
      if (index === -1) return
      this.recetas[index] = { ...cambios, id }
    },
  },
})
