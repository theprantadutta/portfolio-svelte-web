/**
 * Builds static/favicon.ico from static/favicon.png.
 *
 * Browsers and crawlers request /favicon.ico by convention whether or not the
 * page declares a <link rel="icon">, so the file has to exist even though the
 * markup points at the PNG. A .ico is a container: this writes a real
 * multi-resolution one (16/32/48) so each context picks the size it wants
 * instead of downscaling a 512px source every paint.
 *
 * The payloads are PNGs rather than BMPs. ICO has allowed PNG-compressed
 * entries since Windows Vista and every browser in use supports them; it keeps
 * the file a fraction of the BMP size and avoids hand-rolling bottom-up BGRA
 * rows and an AND mask.
 *
 * Run with: node scripts/generate-favicon.mjs
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(root, 'static', 'favicon.png')
const OUTPUT = join(root, 'static', 'favicon.ico')

// 16 for the address bar, 32 for tabs and hi-dpi, 48 for Windows shortcuts.
const SIZES = [16, 32, 48]

const ICONDIR_SIZE = 6
const ICONDIRENTRY_SIZE = 16

const images = await Promise.all(
  SIZES.map((size) =>
    sharp(SOURCE)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toBuffer()
  )
)

const header = Buffer.alloc(ICONDIR_SIZE)
header.writeUInt16LE(0, 0) // reserved
header.writeUInt16LE(1, 2) // 1 = icon (2 would be cursor)
header.writeUInt16LE(SIZES.length, 4)

let offset = ICONDIR_SIZE + ICONDIRENTRY_SIZE * SIZES.length

const entries = SIZES.map((size, i) => {
  const entry = Buffer.alloc(ICONDIRENTRY_SIZE)
  // 0 encodes 256 in this single byte; harmless here but kept explicit.
  entry.writeUInt8(size >= 256 ? 0 : size, 0)
  entry.writeUInt8(size >= 256 ? 0 : size, 1)
  entry.writeUInt8(0, 2) // palette size, 0 for truecolour
  entry.writeUInt8(0, 3) // reserved
  entry.writeUInt16LE(1, 4) // colour planes
  entry.writeUInt16LE(32, 6) // bits per pixel
  entry.writeUInt32LE(images[i].length, 8)
  entry.writeUInt32LE(offset, 12)
  offset += images[i].length
  return entry
})

const ico = Buffer.concat([header, ...entries, ...images])
writeFileSync(OUTPUT, ico)

console.log(
  `favicon.ico: ${SIZES.join('/')} — ${ico.length} bytes ` +
    `(${images.map((b, i) => `${SIZES[i]}px:${b.length}b`).join(', ')})`
)
