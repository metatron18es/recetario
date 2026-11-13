// Textos de la interfaz para los códigos de error de la API. La API devuelve `code` (estable) y un
// `message` en inglés para desarrolladores que nunca se muestra al usuario.
const TEXTOS: Record<string, string> = {
  NOT_AUTHENTICATED: 'Necesitas iniciar sesión',
  INVALID_SESSION: 'Tu sesión ha caducado. Vuelve a iniciar sesión',
  ADMIN_REQUIRED: 'Solo el administrador puede hacer esto',
  NAME_REQUIRED: 'El nombre es obligatorio',
  INVALID_EMAIL: 'El email no es válido',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
  EMAIL_TAKEN: 'Ya existe una cuenta con ese email',
  SIGNUP_FAILED: 'No se pudo crear la cuenta',
  CREDENTIALS_INVALID: 'Email o contraseña incorrectos',
  LOGIN_FAILED: 'No se pudo iniciar sesión',
  SIGN_IN_REQUIRED: 'Inicia sesión para ver tus recetas',
  INVALID_PAGINATION: 'Parámetros de paginación no válidos',
  INVALID_ID: 'Identificador no válido',
  RECIPE_NOT_FOUND: 'Receta no encontrada',
  RECIPES_LOAD_FAILED: 'No se pudieron cargar las recetas',
  RECIPE_LOAD_FAILED: 'No se pudo cargar la receta',
  RECIPE_NAME_REQUIRED: 'El nombre de la receta es obligatorio',
  INVALID_MEAL_TYPE: 'Tipo de comida no válido',
  INVALID_PREP_TIME: 'El tiempo debe ser un número entero de minutos mayor que 0',
  INVALID_RECIPE_BODY: 'Los datos de la receta no son válidos',
  INGREDIENTS_REQUIRED: 'Añade al menos un ingrediente',
  INVALID_INGREDIENT: 'Cada ingrediente necesita una cantidad mayor que 0 y una unidad válida',
  DUPLICATE_INGREDIENT: 'Hay un ingrediente repetido',
  STEPS_REQUIRED: 'Añade al menos un paso',
  INGREDIENT_NOT_FOUND: 'Algún ingrediente ya no existe en el catálogo',
  RECIPE_CREATE_FAILED: 'No se pudo guardar la receta',
  NOT_RECIPE_OWNER: 'Solo el autor o el administrador pueden editar esta receta',
  RECIPE_UPDATE_FAILED: 'No se pudo guardar la receta',
  INGREDIENTS_LOAD_FAILED: 'No se pudo cargar el catálogo de ingredientes',
}

export const ERROR_GENERICO = 'Algo ha ido mal. Inténtalo de nuevo'

export function textoDeError(code?: string): string {
  return (code && TEXTOS[code]) || ERROR_GENERICO
}
