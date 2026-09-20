import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { PNG } from 'pngjs'

// Validates the actual rendered head area against the generated UV face assets.
const url = process.env.AVATAR_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const outputDir = path.resolve('.github/face-smoke-output')
fs.mkdirSync(outputDir, { recursive: true })

const errors = []
page.on('pageerror', (error) => errors.push(String(error)))
page.on('console', (message) => {
  const text = message.text()
  if (
    text.includes('THREE.WebGLProgram') ||
    text.includes('Shader Error') ||
    text.includes('VALIDATE_STATUS false') ||
    text.includes('WebGL: INVALID_')
  ) {
    errors.push(text)
  }
})

await page.goto(`${url}?debugBind=1`, { waitUntil: 'networkidle' })
await page.waitForSelector('canvas')
await page.waitForTimeout(1200)
const bindBuffer = await page.locator('canvas').screenshot({ type: 'png' })
fs.writeFileSync(path.join(outputDir, 'bind-position-debug.png'), bindBuffer)
const bindPng = PNG.sync.read(bindBuffer)

function decodeBindAt(xf, yf, label) {
  const x = Math.max(0, Math.min(bindPng.width - 1, Math.round(bindPng.width * xf)))
  const y = Math.max(0, Math.min(bindPng.height - 1, Math.round(bindPng.height * yf)))
  const radius = 3
  let r = 0, g = 0, b = 0, n = 0
  for (let yy = Math.max(0, y - radius); yy <= Math.min(bindPng.height - 1, y + radius); yy++) {
    for (let xx = Math.max(0, x - radius); xx <= Math.min(bindPng.width - 1, x + radius); xx++) {
      const i = (bindPng.width * yy + xx) * 4
      r += bindPng.data[i]
      g += bindPng.data[i + 1]
      b += bindPng.data[i + 2]
      n++
    }
  }
  r /= n; g /= n; b /= n
  const px = (r / 255) * 0.70 - 0.35
  const py = (g / 255) * 1.10
  const pz = (b / 255) * 0.54 - 0.27
  console.log(`BIND_SAMPLE ${label}: screen=(${x},${y}) bind=(${px.toFixed(4)},${py.toFixed(4)},${pz.toFixed(4)}) rgb=(${r.toFixed(1)},${g.toFixed(1)},${b.toFixed(1)})`)
}

decodeBindAt(0.458, 0.363, 'left-eye')
decodeBindAt(0.536, 0.363, 'right-eye')
decodeBindAt(0.500, 0.434, 'mouth')

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForSelector('canvas')
await page.waitForTimeout(1500)

const faceCategory = page
  .getByRole('navigation', { name: 'Catégories du vestiaire' })
  .getByRole('button', { name: 'Visage' })
  .first()
await faceCategory.click()
await page.getByRole('button', { name: 'Classique' }).waitFor()

const faces = ['Classique', 'Souriant', 'Déterminé', 'Surpris']
const captures = new Map()

for (const face of faces) {
  await page.getByRole('button', { name: face }).click()
  await page.waitForTimeout(900)

  const buffer = await page.locator('canvas').screenshot({ type: 'png' })
  fs.writeFileSync(path.join(outputDir, `${face}.png`), buffer)

  const png = PNG.sync.read(buffer)
  const x0 = Math.floor(png.width * 0.32)
  const x1 = Math.floor(png.width * 0.68)
  const y0 = Math.floor(png.height * 0.10)
  const y1 = Math.floor(png.height * 0.50)

  const pixels = []
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (png.width * y + x) * 4
      pixels.push(png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3])
    }
  }

  captures.set(face, { pixels, width: x1 - x0, height: y1 - y0 })
  console.log(`${face}: face crop ${x1 - x0}x${y1 - y0}`)
}

await browser.close()

if (errors.length) {
  console.error('Browser/WebGL errors detected:')
  for (const error of errors) console.error(error)
  process.exit(1)
}

function changedPixels(a, b, threshold = 28) {
  if (a.pixels.length !== b.pixels.length) throw new Error('Mismatched crop sizes')
  let changed = 0
  for (let i = 0; i < a.pixels.length; i += 4) {
    const d =
      Math.abs(a.pixels[i] - b.pixels[i]) +
      Math.abs(a.pixels[i + 1] - b.pixels[i + 1]) +
      Math.abs(a.pixels[i + 2] - b.pixels[i + 2])
    if (d >= threshold) changed++
  }
  return changed
}

const classic = captures.get('Classique')
if (!classic) throw new Error('Missing classic capture')

for (const face of faces.slice(1)) {
  const capture = captures.get(face)
  const changed = changedPixels(classic, capture)
  console.log(`${face}: ${changed} changed pixels inside the head crop vs Classique`)
  if (changed < 450) {
    console.error(
      `Face render smoke test failed: ${face} does not visibly change the head crop enough (${changed} pixels).`,
    )
    process.exit(1)
  }
}

for (let i = 1; i < faces.length; i++) {
  for (let j = i + 1; j < faces.length; j++) {
    const a = captures.get(faces[i])
    const b = captures.get(faces[j])
    const changed = changedPixels(a, b)
    console.log(`${faces[i]} vs ${faces[j]}: ${changed} changed face pixels`)
    if (changed < 250) {
      console.error(
        `Face render smoke test failed: ${faces[i]} and ${faces[j]} are visually too similar.`,
      )
      process.exit(1)
    }
  }
}

console.log('Face render smoke test passed: the actual head area visibly changes for all face assets.')
