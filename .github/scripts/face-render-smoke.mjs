import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { PNG } from 'pngjs'

const sceneSource = fs.readFileSync('src/avatar/AvatarScene.tsx', 'utf8')
for (const forbidden of [
  'ProceduralHead',
  'sphereGeometry',
  'HardHat',
  'function Hair',
  'function Mouth',
  'function Brows',
  '__face_overlay',
  'avatarReplaceMouth',
]) {
  if (sceneSource.includes(forbidden)) {
    throw new Error(`Forbidden fake/procedural avatar code still present: ${forbidden}`)
  }
}

const appSource = fs.readFileSync('src/App.tsx', 'utf8')
if (!appSource.includes('/assets/avatar/v3/base/avatar-neutral-rigged.glb')) {
  throw new Error('Approved rigged neutral avatar is not wired in App.tsx')
}

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
    text.includes('WebGL: INVALID_') ||
    text.includes('404')
  ) errors.push(text)
})

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForSelector('canvas')
await page.waitForTimeout(2500)

const buffer = await page.locator('canvas').screenshot({ type: 'png' })
fs.writeFileSync(path.join(outputDir, 'approved-real-base.png'), buffer)
const image = PNG.sync.read(buffer)

let nonBackground = 0
for (let i = 0; i < image.data.length; i += 4) {
  const r = image.data[i]
  const g = image.data[i + 1]
  const b = image.data[i + 2]
  const delta = Math.abs(r - 231) + Math.abs(g - 227) + Math.abs(b - 224)
  if (delta > 40) nonBackground++
}

console.log(`Real-base foreground pixels: ${nonBackground}`)
if (nonBackground < 12000) {
  throw new Error(`Approved real base appears missing/too small: ${nonBackground}`)
}

await browser.close()

if (errors.length) {
  console.error('Browser/WebGL errors detected:')
  for (const error of errors) console.error(error)
  process.exit(1)
}

console.log('Approved rigged neutral avatar renders without procedural face/hair/helmet hacks.')
