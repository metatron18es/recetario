import type { Response } from 'express'

// Stable error codes with an English message for developers. The frontend translates by `code`
// and never shows `message` to the user.
const MESSAGES = {
  NOT_AUTHENTICATED: 'Not authenticated',
  INVALID_SESSION: 'Invalid or expired session',
  ADMIN_REQUIRED: 'Admin role required',
  NAME_REQUIRED: 'Name is required',
  INVALID_EMAIL: 'Invalid email',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  EMAIL_TAKEN: 'An account with that email already exists',
  SIGNUP_FAILED: 'Could not create the account',
  CREDENTIALS_INVALID: 'Incorrect email or password',
  LOGIN_FAILED: 'Could not sign in',
  SIGN_IN_REQUIRED: 'Sign in to see your recipes',
  INVALID_PAGINATION: 'Invalid pagination parameters',
  INVALID_ID: 'Invalid id',
  RECIPE_NOT_FOUND: 'Recipe not found',
  RECIPES_LOAD_FAILED: 'Could not load recipes',
  RECIPE_LOAD_FAILED: 'Could not load the recipe',
  RECIPE_NAME_REQUIRED: 'Recipe name is required',
  INVALID_MEAL_TYPE: 'Invalid meal type',
  INVALID_PREP_TIME: 'Preparation time must be a positive whole number of minutes',
  INVALID_RECIPE_BODY: 'Invalid recipe body',
  INGREDIENTS_REQUIRED: 'At least one ingredient is required',
  INVALID_INGREDIENT: 'Each ingredient needs a positive quantity, a valid unit and an existing or proposed ingredient',
  DUPLICATE_INGREDIENT: 'An ingredient appears more than once',
  STEPS_REQUIRED: 'At least one step is required',
  INGREDIENT_NOT_FOUND: 'Ingredient not found',
  RECIPE_CREATE_FAILED: 'Could not create the recipe',
  NOT_RECIPE_OWNER: 'Only the author or the admin can edit this recipe',
  RECIPE_UPDATE_FAILED: 'Could not update the recipe',
  RECIPE_IN_USE: 'The recipe is used in calendars; confirm with force=true to delete it',
  RECIPE_DELETE_FAILED: 'Could not delete the recipe',
  INGREDIENTS_LOAD_FAILED: 'Could not load ingredients',
} as const

export type ErrorCode = keyof typeof MESSAGES

export function isErrorCode(value: string): value is ErrorCode {
  return value in MESSAGES
}

export function sendError(res: Response, status: number, code: ErrorCode, extra: Record<string, unknown> = {}) {
  res.status(status).json({ error: { code, message: MESSAGES[code], ...extra } })
}
