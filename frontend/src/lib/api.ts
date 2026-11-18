import type { MealType } from '@recetario/shared'
import { textoDeError } from './errores'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export async function getApiHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${API_URL}/api/health`)
  if (!res.ok) throw new Error(`API respondió ${res.status}`)
  return res.json()
}

export interface UsuarioApi {
  id: number
  nombre: string
  email: string
  rol: string
}

// US-01: crea la cuenta. Lanza Error con el mensaje de la API (p. ej. email duplicado).
export async function registrarUsuario(datos: {
  nombre: string
  email: string
  password: string
}): Promise<UsuarioApi> {
  const res = await fetch(`${API_URL}/api/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(textoDeError(body.error?.code))
  return body
}

// US-02: inicia sesión; la API deja el JWT en una cookie httpOnly.
export async function iniciarSesion(datos: { email: string; password: string }): Promise<UsuarioApi> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(textoDeError(body.error?.code))
  return body
}

// US-03: cierra sesión; la API borra la cookie del JWT.
export async function cerrarSesion(): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' })
  if (!res.ok) throw new Error(`API respondió ${res.status}`)
}

// US-04: usuario de la sesión actual (cookie); null si no hay sesión o expiró.
export async function obtenerSesion(): Promise<UsuarioApi | null> {
  const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
  if (res.status === 401) return null
  if (!res.ok) throw new Error(`API respondió ${res.status}`)
  return res.json()
}

export interface IngredienteApi {
  id: number
  name: string
  kcalPer100g: number
  minDiet: string
  validated: boolean
}

export interface RecetaApi {
  id: number
  name: string
  mealType: MealType
  prepTimeMin: number
  description: string
  kcal: number
  author: { id: number; name: string } | null
  ingredients: { ingredientId: number; name: string; quantity: number; unit: string }[]
  // URLs relativas a la API (`/uploads/...`); usar `urlImagen` para mostrarlas.
  images: string[]
  steps: { text: string; images: string[] }[]
}

// US-05: catálogo de ingredientes (validados + los propuestos por el usuario de la sesión).
export async function listarIngredientes(): Promise<IngredienteApi[]> {
  const res = await fetch(`${API_URL}/api/ingredients`, { credentials: 'include' })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(textoDeError(body.error?.code))
  return body
}

export interface NuevaRecetaApi {
  name: string
  mealType: MealType
  prepTimeMin: number
  description: string
  // Un ingrediente del catálogo (`ingredientId`) o uno propuesto (`proposed`), que queda pendiente de validar.
  ingredients: {
    ingredientId?: number
    proposed?: { name: string; kcalPer100g: number }
    quantity: number
    unit: string
  }[]
  // Nombres de fichero devueltos por `subirImagen`; solo se envían al crear (editar las ignora, #6).
  images?: string[]
  steps: (string | { text: string; images: string[] })[]
}

// US-06: reemplaza la receta; solo su autor o el administrador.
export async function actualizarReceta(id: number, datos: NuevaRecetaApi): Promise<RecetaApi> {
  const res = await fetch(`${API_URL}/api/recipes/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(textoDeError(body.error?.code))
  return body
}

// US-05: crea la receta; queda asociada al autor de la sesión y es pública.
export async function crearReceta(datos: NuevaRecetaApi): Promise<RecetaApi> {
  const res = await fetch(`${API_URL}/api/recipes`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(textoDeError(body.error?.code))
  return body
}

// US-08/US-09: lista pública con filtros opcionales (`q` busca en nombre e ingredientes). La API
// pagina (máx. 50), así que se piden todas las páginas.
export async function listarRecetas(filtros: { q?: string; mealType?: MealType } = {}): Promise<RecetaApi[]> {
  const limit = 50
  const todas: RecetaApi[] = []
  for (let page = 1; ; page++) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (filtros.q) params.set('q', filtros.q)
    if (filtros.mealType) params.set('mealType', filtros.mealType)
    const res = await fetch(`${API_URL}/api/recipes?${params}`, { credentials: 'include' })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(textoDeError(body.error?.code))
    todas.push(...body.recipes)
    if (todas.length >= body.total || body.recipes.length === 0) return todas
  }
}

// US-08: detalle público; la API responde 404 si no existe.
export async function obtenerReceta(id: number): Promise<RecetaApi> {
  const res = await fetch(`${API_URL}/api/recipes/${id}`, { credentials: 'include' })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(textoDeError(body.error?.code))
  return body
}

// US-87: las URLs de fotos que devuelve la API son relativas (`/uploads/x.png`) y las sirve el backend.
export const urlImagen = (ruta: string) => `${API_URL}${ruta}`

// Sube una foto (data URL del selector) y devuelve el nombre de fichero que luego se envía con la receta.
export async function subirImagen(dataUrl: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob()
  const res = await fetch(`${API_URL}/api/recipes/images`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': blob.type },
    body: blob,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(textoDeError(body.error?.code))
  return body.file
}
