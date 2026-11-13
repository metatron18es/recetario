import { ref } from 'vue'
import type { UsuarioApi } from './api'

// Usuario de la sesión actual (null = visitante). Lo actualiza el guard del router en cada navegación.
export const sesion = ref<UsuarioApi | null>(null)
