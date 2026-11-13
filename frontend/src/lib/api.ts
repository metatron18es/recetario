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
