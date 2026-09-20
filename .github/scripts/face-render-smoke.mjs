import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { PNG } from 'pngjs'

const sceneSource = fs.readFileSync('src/avatar/AvatarScene.tsx', 'utf8')
for (const forbidden of ['createFaceOverlayMaterial', '__face_overlay', 'avatarReplaceMouth', 'avatarFaceExpression']) {
  if (sceneSource.includes(forbidden)) {
    throw new Error(`Forbidden legacy 2D face-overlay code still present: ${forbidden}`)
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
  ) errors.push(text)
})

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForSelector('canvas')
await page.waitForTimeout(1500)

async function capture(name) {
  await page.waitForTimeout(700)
  const buffer = await page.locator('canvas').screenshot({ type: 'png' })
  fs.writeFileSync(path.join(outputDir, `${name}.png`), buffer)
  return PNG.sync.read(buffer)
}

function changedPixels(a, b, threshold = 30) {
  if (a.width !== b.width || a.height !== b.height) throw new Error('Mismatched captures')
  let changed = 0
  for (let i = 0; i < a.data.length; i += 4) {
    const d =
      Math.abs(a.data[i] - b.data[i]) +
      Math.abs(a.data[i + 1] - b.data[i + 1]) +
      Math.abs(a.data[i + 2] - b.data[i + 2])
    if (d >= threshold) changed++
  }
  return changed
}

const faceCategory = page
  .getByRole('navigation', { name: 'Catégories du vestiaire' })
  .getByRole('button', { name: 'Visage' })
  .first()
await faceCategory.click()
await page.getByRole('button', { name: 'Classique' }).first().waitFor()

const classic = await capture('face-classic')
await page.getByRole('button', { name: 'Surpris' }).first().click()
const surprised = await capture('face-surprised')
const faceChanged = changedPixels(classic, surprised, 24)
console.log(`3D face switch: ${faceChanged} changed pixels`)
if (faceChanged < 120) throw new Error(`3D face switch too subtle: ${faceChanged}`)

const hairCategory = page
  .getByRole('navigation', { name: 'Catégories du vestiaire' })
  .getByRole('button', { name: 'Coiffure' })
  .first()
await hairCategory.click()
await page.getByRole('button', { name: 'Court' }).first().click()
const hair = await capture('hair-short')
const hairChanged = changedPixels(surprised, hair, 24)
console.log(`3D hair switch: ${hairChanged} changed pixels`)
if (hairChanged < 150) throw new Error(`3D hair switch too subtle: ${hairChanged}`)

const accessoryCategory = page
  .getByRole('navigation', { name: 'Catégories du vestiaire' })
  .getByRole('button', { name: 'Accessoire' })
  .first()
await accessoryCategory.click()
await page.getByRole('button', { name: 'Ceinture outils' }).first().click()
const accessory = await capture('accessory-toolbelt')
const accessoryChanged = changedPixels(hair, accessory, 24)
console.log(`3D accessory switch: ${accessoryChanged} changed pixels`)
if (accessoryChanged < 100) throw new Error(`3D accessory switch too subtle: ${accessoryChanged}`)

const outfitCategory = page
  .getByRole('navigation', { name: 'Catégories du vestiaire' })
  .getByRole('button', { name: 'Tenue' })
  .first()
await outfitCategory.click()
const chantier = await capture('outfit-chantier')
await page.getByRole('button', { name: 'Électricien' }).first().click()
await page.waitForTimeout(1200)
const electricien = await capture('outfit-electricien')
const outfitChanged = changedPixels(chantier, electricien, 36)
console.log(`Rigged outfit switch: ${outfitChanged} changed pixels`)
if (outfitChanged < 1200) throw new Error(`Rigged outfit switch too subtle: ${outfitChanged}`)

const stored = await page.evaluate(() => {
  const raw = localStorage.getItem('maitre-artisan-avatar-v3')
  return raw ? JSON.parse(raw) : null
})
if (stored?.faceId !== 'face-surprised-3d') throw new Error(`Face not persisted: ${stored?.faceId}`)
if (stored?.hairStyleId !== 'hair-short-3d') throw new Error(`Hair not persisted: ${stored?.hairStyleId}`)
if (stored?.outfit?.accessoryId !== 'accessory-toolbelt-3d') throw new Error(`Accessory not persisted: ${stored?.outfit?.accessoryId}`)
if (stored?.outfitPresetId !== 'outfit-electricien') throw new Error(`Outfit not persisted: ${stored?.outfitPresetId}`)

await browser.close()

if (errors.length) {
  console.error('Browser/WebGL errors detected:')
  for (const error of errors) console.error(error)
  process.exit(1)
}

console.log('Complete wardrobe smoke passed: 3D face, hair, accessory and rigged outfit all change visibly.')
