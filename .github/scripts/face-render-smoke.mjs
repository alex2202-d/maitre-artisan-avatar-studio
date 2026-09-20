import crypto from 'node:crypto'
import { chromium } from 'playwright'

const url = process.env.AVATAR_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })

const errors = []
page.on('pageerror', (error) => errors.push(String(error)))
page.on('console', (message) => {
  const text = message.text()
  if (
    message.type() === 'error' ||
    text.includes('THREE.WebGLProgram') ||
    text.includes('Shader Error') ||
    text.includes('VALIDATE_STATUS false')
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
await page.getByRole('button', { name: 'Classique' }).waitFor()

const faces = ['Classique', 'Souriant', 'Déterminé', 'Surpris']
const hashes = new Map()

for (const face of faces) {
  await page.getByRole('button', { name: face }).click()
  await page.waitForTimeout(700)
  const image = await page.locator('canvas').screenshot({ type: 'png' })
  const hash = crypto.createHash('sha256').update(image).digest('hex')
  hashes.set(face, hash)
  console.log(`${face}: ${hash}`)
}

await browser.close()

if (errors.length) {
  console.error('Browser/WebGL errors detected:')
  for (const error of errors) console.error(error)
  process.exit(1)
}

const unique = new Set(hashes.values())
if (unique.size !== faces.length) {
  console.error('Face render smoke test failed: at least two face canvases are identical.')
  console.error(Object.fromEntries(hashes))
  process.exit(1)
}

console.log('Face render smoke test passed: four distinct WebGL canvases, no shader errors.')
