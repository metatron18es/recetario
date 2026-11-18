import type { RequestHandler } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import { z } from 'zod'
import { isErrorCode, sendError, type ErrorCode } from './errors.js'

type Part<S extends z.ZodTypeAny> = {
  schema: S
  // Error code when the failure matches nothing below.
  fallback: ErrorCode
  // Declarative map "field -> code". Keys are paths with `*` for array indexes
  // (e.g. `ingredients.*`); the longest matching prefix of the first issue wins.
  fields?: Record<string, ErrorCode>
  status?: number
}

// A schema can also put an ErrorCode as the issue message (`z.string().min(1, 'NAME_REQUIRED')`);
// that wins over `fields`.
function codeFor(error: z.ZodError, { fields = {}, fallback }: Part<z.ZodTypeAny>): ErrorCode {
  const issue = error.issues[0]
  if (isErrorCode(issue.message)) return issue.message
  const path = issue.path.map((p) => (typeof p === 'number' ? '*' : p))
  for (let n = path.length; n > 0; n--) {
    const code = fields[path.slice(0, n).join('.')]
    if (code) return code
  }
  return fallback
}

type Parts = { params?: Part<z.ZodTypeAny>; query?: Part<z.ZodTypeAny>; body?: Part<z.ZodTypeAny> }
type Out<P extends Part<z.ZodTypeAny> | undefined> = P extends Part<infer S> ? z.output<S> : unknown

// Validates params, query and body; on success replaces them with the parsed, typed data.
export function validate<T extends Parts>(parts: T): RequestHandler<ParamsDictionary, unknown, Out<T['body']>, Out<T['query']>> {
  return (req, res, next) => {
    for (const key of ['params', 'query', 'body'] as const) {
      const part = parts[key]
      if (!part) continue
      const parsed = part.schema.safeParse(req[key])
      if (!parsed.success) return sendError(res, part.status ?? 400, codeFor(parsed.error, part))
      Object.defineProperty(req, key, { value: parsed.data, writable: true, configurable: true, enumerable: true })
    }
    next()
  }
}

// Route params stay strings (Express types them from the path): validate, then `Number(req.params.id)`.
export const idParams = {
  schema: z.object({ id: z.string().regex(/^\d+$/).refine((v) => Number(v) >= 1) }),
  fallback: 'INVALID_ID' as const,
}
