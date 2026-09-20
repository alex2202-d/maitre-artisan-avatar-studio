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

for (const required of [
  'headwear_hardhat_v2.glb',
  'top_workwear_v2.glb',
  'bottom_workshort_v2.glb',
  'gloves_work_v2.glb',
  'shoes_work_boots_v2.glb',
]) {
  if (!sceneSource.includes(required)) {
    throw new Error(`Real modular GLB is not wired into the viewer: ${required}`)
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
await page.waitForTimeout(2200)

async function capture(name) {
  await page.waitForTimeout(900)
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

function category(name) {
  return page
    .getByRole('navigation', { name: 'Catégories du vestiaire' })
    .getByRole('button', { name })
    .first()
}

await category('Visage').click()
await page.getByRole('button', { name: 'Classique' }).first().waitFor()
const classic = await capture('face-classic')
await page.getByRole('button', { name: 'Surpris' }).first().click()
const surprised = await capture('face-surprised')
const faceChanged = changedPixels(classic, surprised, 24)
console.log(`3D face switch: ${faceChanged} changed pixels`)
if (faceChanged < 120) throw new Error(`3D face switch too subtle: ${faceChanged}`)

await category('Coiffure').click()
await page.getByRole('button', { name: 'Court' }).first().click()
const hair = await capture('hair-short')
const hairChanged = changedPixels(surprised, hair, 24)
console.log(`3D hair switch: ${hairChanged} changed pixels`)
if (hairChanged < 150) throw new Error(`3D hair switch too subtle: ${hairChanged}`)

await category('Casque').click()
const noHelmet = await capture('helmet-none')
await page.getByRole('button', { name: 'Jaune' }).first().click()
const helmet = await capture('helmet-yellow')
const helmetChanged = changedPixels(noHelmet, helmet, 24)
console.log(`Real GLB helmet switch: ${helmetChanged} changed pixels`)
if (helmetChanged < 350) throw new Error(`Real GLB helmet not visible enough: ${helmetChanged}`)

await category('Haut').click()
const blueTop = await capture('top-blue')
await page.getByRole('button', { name: 'Rouge' }).first().click()
const redTop = await capture('top-red')
const topChanged = changedPixels(blueTop, redTop, 24)
console.log(`Real GLB top switch: ${topChanged} changed pixels`)
if (topChanged < 1000) throw new Error(`Real GLB top switch too subtle: ${topChanged}`)

await category('Bas').click()
const blueBottom = await capture('bottom-blue')
await page.getByRole('button', { name: 'Rouge' }).first().click()
const redBottom = await capture('bottom-red')
const bottomChanged = changedPixels(blueBottom, redBottom, 24)
console.log(`Real GLB bottom switch: ${bottomChanged} changed pixels`)
if (bottomChanged < 700) throw new Error(`Real GLB bottom switch too subtle: ${bottomChanged}`)

await category('Gants').click()
const yellowGloves = await capture('gloves-yellow')
await page.getByRole('button', { name: 'Orange' }).first().click()
const orangeGloves = await capture('gloves-orange')
const glovesChanged = changedPixels(yellowGloves, orangeGloves, 24)
console.log(`Real GLB gloves switch: ${glovesChanged} changed pixels`)
if (glovesChanged < 180) throw new Error(`Real GLB gloves switch too subtle: ${glovesChanged}`)

await category('Chaussures').click()
const brownShoes = await capture('shoes-brown')
await page.getByRole('button', { name: 'Noir' }).first().click()
const blackShoes = await capture('shoes-black')
const shoesChanged = changedPixels(brownShoes, blackShoes, 24)
console.log(`Real GLB shoes switch: ${shoesChanged} changed pixels`)
if (shoesChanged < 180) throw new Error(`Real GLB shoes switch too subtle: ${shoesChanged}`)

await category('Accessoire').click()
const noAccessory = await capture('accessory-none')
await page.getByRole('button', { name: 'Ceinture outils' }).first().click()
const accessory = await capture('accessory-toolbelt')
const accessoryChanged = changedPixels(noAccessory, accessory, 24)
console.log(`3D accessory switch: ${accessoryChanged} changed pixels`)
if (accessoryChanged < 100) throw new Error(`3D accessory switch too subtle: ${accessoryChanged}`)

const stored = await page.evaluate(() => {
  const raw = localStorage.getItem('maitre-artisan-avatar-v3')
  return raw ? JSON.parse(raw) : null
})
if (stored?.faceId !== 'face-surprised-3d') throw new Error(`Face not persisted: ${stored?.faceId}`)
if (stored?.hairStyleId !== 'hair-short-3d') throw new Error(`Hair not persisted: ${stored?.hairStyleId}`)
if (stored?.outfit?.headwearId !== 'helmet-yellow') throw new Error(`Helmet not persisted: ${stored?.outfit?.headwearId}`)
if (stored?.outfit?.topId !== 'top-red-v3') throw new Error(`Top not persisted: ${stored?.outfit?.topId}`)
if (stored?.outfit?.bottomId !== 'bottom-red-v3') throw new Error(`Bottom not persisted: ${stored?.outfit?.bottomId}`)
if (stored?.outfit?.glovesId !== 'gloves-orange-v3') throw new Error(`Gloves not persisted: ${stored?.outfit?.glovesId}`)
if (stored?.outfit?.shoesId !== 'shoes-black-v3') throw new Error(`Shoes not persisted: ${stored?.outfit?.shoesId}`)
if (stored?.outfit?.accessoryId !== 'accessory-toolbelt-3d') throw new Error(`Accessory not persisted: ${stored?.outfit?.accessoryId}`)

await browser.close()

if (errors.length) {
  console.error('Browser/WebGL errors detected:')
  for (const error of errors) console.error(error)
  process.exit(1)
}

console.log('Real modular wardrobe smoke passed: face, hair, helmet, top, bottom, gloves, shoes and accessory are visible and persisted.')
