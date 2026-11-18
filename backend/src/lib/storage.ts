import { randomUUID } from 'node:crypto'
import { access, mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Only module that knows where photos live. Routes use these functions and never touch the disk,
// so the local folder can be swapped for an external service (Vercel does not persist disk).
export const UPLOADS_DIR =
  process.env.UPLOADS_DIR ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads')

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_RECIPE_IMAGES = 5
export const MAX_STEP_IMAGES = 3

export const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as const
export type ImageMime = keyof typeof IMAGE_TYPES

// File names are generated here (uuid + extension); anything else is rejected, which also blocks path tricks.
export const IMAGE_FILE_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/

// Checks the real content (magic bytes), not only the declared Content-Type.
export function matchesMime(buf: Buffer, mime: ImageMime): boolean {
  if (mime === 'image/jpeg') return buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
  if (mime === 'image/png') return buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  return buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP'
}

export async function saveImage(buf: Buffer, mime: ImageMime): Promise<string> {
  await mkdir(UPLOADS_DIR, { recursive: true })
  const file = `${randomUUID()}.${IMAGE_TYPES[mime]}`
  await writeFile(path.join(UPLOADS_DIR, file), buf)
  return file
}

export async function deleteImage(file: string): Promise<void> {
  if (!IMAGE_FILE_RE.test(file)) return
  await unlink(path.join(UPLOADS_DIR, file)).catch(() => {})
}

export async function imageExists(file: string): Promise<boolean> {
  if (!IMAGE_FILE_RE.test(file)) return false
  return access(path.join(UPLOADS_DIR, file)).then(() => true, () => false)
}

export const imageUrl = (file: string) => `/uploads/${file}`
