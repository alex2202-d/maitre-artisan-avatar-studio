import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { PNG } from 'pngjs'

const url = process.env.AVATAR_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const outputDir = path.resolve('.github/face-smoke-output')
fs.mkdirSync(outputDir, { recursive: true })

const errors = []
page.on('pageerror', (error) => errors.push(String(error)))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForSelector('.main-avatar')
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(outputDir, 'wardrobe-2d-full-ui.png'), fullPage: true })

async function capture(name) {
  const buffer = await page.locator('.stage-card').screenshot({ type: 'png' })
  fs.writeFileSync(path.join(outputDir, `${name}.png`), buffer)
  return PNG.sync.read(buffer)
}

function changedPixels(a, b, threshold = 30) {
  if (a.width !== b.width || a.height !== b.height) throw new Error('Mismatched captures')
  let changed = 0
  for (let i = 0; i < a.data.length; i += 4) {
    const d = Math.abs(a.data[i]-b.data[i]) + Math.abs(a.data[i+1]-b.data[i+1]) + Math.abs(a.data[i+2]-b.data[i+2])
    if (d >= threshold) changed++
  }
  return changed
}

const initial = await capture('wardrobe-2d-chantier')

await page.getByRole('navigation', { name: 'Catégories du vestiaire' }).getByRole('button', { name: /Visage/ }).click()
await page.getByRole('button', { name: 'Surpris' }).click()
await page.waitForTimeout(200)
const surprised = await capture('wardrobe-2d-surprised')
if (changedPixels(initial, surprised, 24) < 250) throw new Error('Expression did not visibly change')

await page.getByRole('navigation', { name: 'Catégories du vestiaire' }).getByRole('button', { name: /Coiffure/ }).click()
await page.getByRole('button', { name: 'Ébouriffé' }).click()
await page.waitForTimeout(200)
const hair = await capture('wardrobe-2d-hair')
if (changedPixels(surprised, hair, 24) < 500) throw new Error('Hair did not visibly change')

await page.getByRole('navigation', { name: 'Catégories du vestiaire' }).getByRole('button', { name: /Tenue/ }).click()
await page.getByRole('button', { name: /Électricien/ }).click()
await page.waitForTimeout(200)
const electrician = await capture('wardrobe-2d-electrician')
if (changedPixels(hair, electrician, 24) < 1500) throw new Error('Outfit preset did not visibly change')

const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('maitre-artisan-avatar-2d') || '{}'))
if (saved.expression !== 'surprised') throw new Error('Expression is not persisted')
if (saved.hair !== 'spiky') throw new Error('Hair is not persisted')
if (saved.top !== 'tee-navy') throw new Error('Outfit is not persisted')

await browser.close()
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log('2D wardrobe smoke passed: expression, hair and outfit change visibly and persist.')
