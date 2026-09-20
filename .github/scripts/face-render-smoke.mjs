import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { PNG } from 'pngjs'

const sceneSource = fs.readFileSync('src/avatar/AvatarScene.tsx', 'utf8')
for (const forbidden of ['createFaceOverlayMaterial', '__face_overlay', 'avatarReplaceMouth', 'onBeforeCompile']) {
  if (sceneSource.includes(forbidden)) {
    throw new Error(`Forbidden legacy face-overlay code still present: ${forbidden}`)
  }
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
    text.includes('WebGL: INVALID_')
  ) {
    errors.push(text)
  }
})

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForSelector('canvas')
await page.waitForTimeout(1500)

const faceCategory = page
  .getByRole('navigation', { name: 'Catégories du vestiaire' })
  .getByRole('button', { name: 'Visage' })
  .first()
await faceCategory.click()
await page.getByRole('button', { name: 'Original 3D' }).first().waitFor()

for (const removed of ['Souriant', 'Déterminé', 'Surpris']) {
  if (await page.getByRole('button', { name: removed }).count()) {
    throw new Error(`Legacy synthetic face option is still exposed: ${removed}`)
  }
}

async function capture(name) {
  await page.waitForTimeout(1000)
  const buffer = await page.locator('canvas').screenshot({ type: 'png' })
  fs.writeFileSync(path.join(outputDir, `${name}.png`), buffer)
  return PNG.sync.read(buffer)
}

const chantier = await capture('outfit-chantier')

const outfitCategory = page
  .getByRole('navigation', { name: 'Catégories du vestiaire' })
  .getByRole('button', { name: 'Tenue' })
  .first()
await outfitCategory.click()
await page.getByRole('button', { name: 'Électricien' }).first().click()
await page.waitForTimeout(1800)

const stored = await page.evaluate(() => {
  const raw = localStorage.getItem('maitre-artisan-avatar-v3')
  return raw ? JSON.parse(raw) : null
})
if (stored?.outfitPresetId !== 'outfit-electricien') {
  throw new Error(`Expected outfit-electricien in v3 storage, got ${stored?.outfitPresetId}`)
}

const electricien = await capture('outfit-electricien')

if (chantier.width !== electricien.width || chantier.height !== electricien.height) {
  throw new Error('Mismatched outfit captures')
}

let changed = 0
for (let y = 0; y < chantier.height; y++) {
  for (let x = 0; x < chantier.width; x++) {
    const i = (chantier.width * y + x) * 4
    const d =
      Math.abs(chantier.data[i] - electricien.data[i]) +
      Math.abs(chantier.data[i + 1] - electricien.data[i + 1]) +
      Math.abs(chantier.data[i + 2] - electricien.data[i + 2])
    if (d >= 36) changed++
  }
}

console.log(`Rigged outfit switch: ${changed} changed pixels`)
if (changed < 1500) {
  throw new Error(`Rigged outfit switch is not visually effective enough (${changed} changed pixels)`)
}

await browser.close()

if (errors.length) {
  console.error('Browser/WebGL errors detected:')
  for (const error of errors) console.error(error)
  process.exit(1)
}

console.log('Modular wardrobe smoke test passed: no face overlay code and rigged outfit switching is visible.')
