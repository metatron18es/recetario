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
} as const

export type ErrorCode = keyof typeof MESSAGES

export function isErrorCode(value: string): value is ErrorCode {
  return value in MESSAGES
}

export function sendError(res: Response, status: number, code: ErrorCode) {
  res.status(status).json({ error: { code, message: MESSAGES[code] } })
}
