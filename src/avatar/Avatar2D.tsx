import { useId, type CSSProperties } from 'react'
import {
  PREMIUM_ATLAS_SIZE,
  PREMIUM_ATLAS_URI,
  PREMIUM_BASE_URI,
  PREMIUM_SPRITES,
  type PremiumSpriteKey,
  type SpriteRect,
} from '../premium/data'

export type Avatar2DConfig = {
  skin: string
  expression: string
  hair: string
  hairColor: string
  headwear: string
  top: string
  bottom: string
  gloves: string
  shoes: string
  accessory: string
}

type Box = { x: number; y: number; w: number; h: number; rotate?: number }
type Half = 'left' | 'right'

const CANVAS_W = 1122
const CANVAS_H = 1402

const presetMap: Record<string, PremiumSpriteKey> = {
  chantier: 'presets_1',
  electricien: 'presets_2',
  technicien: 'presets_3',
  peintre: 'presets_4',
  voirie: 'presets_5',
}

const expressionMap: Record<string, PremiumSpriteKey> = {
  neutral: 'faces_1',
  happy: 'faces_2',
  determined: 'faces_3',
  surprised: 'faces_4',
  sad: 'faces_5',
}

const hairMap: Record<string, PremiumSpriteKey | null> = {
  none: null,
  short: 'hair_5',
  side: 'hair_1',
  spiky: 'hair_2',
  curly: 'hair_3',
  bob: 'hair_4',
  middle: 'hair_1',
  classic: 'hair_5',
  bun: 'hair_4',
}

const headwearMap: Record<string, PremiumSpriteKey | null> = {
  none: null,
  'hardhat-yellow': 'headwear_1',
  'hardhat-blue': 'headwear_4',
  'hardhat-orange': 'headwear_3',
  'cap-white': 'headwear_5',
  'cap-gray': 'headwear_5',
  beanie: 'headwear_2',
}

const topMap: Record<string, PremiumSpriteKey> = {
  'tank-gray': 'tops_1',
  'tee-navy': 'tops_2',
  'jacket-blue': 'tops_3',
  'jacket-olive': 'tops_4',
  'painter-top': 'tops_3',
  'hivis-orange': 'tops_5',
}

const bottomMap: Record<string, PremiumSpriteKey> = {
  'shorts-gray': 'bottoms_1',
  'pants-blue': 'bottoms_2',
  'overalls-blue': 'bottoms_2',
  'cargo-olive': 'bottoms_3',
  'painter-pants': 'bottoms_5',
  'cargo-dark': 'bottoms_4',
}

const gloveMap: Record<string, PremiumSpriteKey | null> = {
  none: null,
  yellow: 'gloves_1',
  black: 'gloves_2',
  orange: 'gloves_3',
  white: 'gloves_4',
  blue: 'gloves_2',
}

const shoeMap: Record<string, PremiumSpriteKey | null> = {
  bare: null,
  'boots-brown': 'shoes_1',
  'boots-black': 'shoes_2',
  'boots-white': 'shoes_4',
  'boots-orange': 'shoes_5',
  'shoes-blue': 'shoes_3',
}

const accessoryMap: Record<string, PremiumSpriteKey | null> = {
  none: null,
  'belt-brown': 'accessories_1',
  'belt-electric': 'accessories_2',
  'belt-mechanic': 'accessories_3',
  'belt-painter': 'accessories_4',
  harness: 'accessories_5',
  'pouch-orange': 'accessories_5',
}

function halfRect(rect: SpriteRect, half?: Half): SpriteRect {
  if (!half) return rect
  const leftW = Math.floor(rect.w / 2)
  if (half === 'left') return { ...rect, w: leftW }
  return { x: rect.x + leftW, y: rect.y, w: rect.w - leftW, h: rect.h }
}

function RasterSprite({
  sprite,
  box,
  half,
}: {
  sprite: PremiumSpriteKey
  box: Box
  half?: Half
}) {
  const clipId = useId().replace(/:/g, '')
  const source = halfRect(PREMIUM_SPRITES[sprite], half)
  const fit = Math.min(box.w / source.w, box.h / source.h)
  const renderW = PREMIUM_ATLAS_SIZE.width * fit
  const renderH = PREMIUM_ATLAS_SIZE.height * fit
  const offsetX = (box.w - source.w * fit) / 2
  const offsetY = (box.h - source.h * fit) / 2
  const imageX = box.x + offsetX - source.x * fit
  const imageY = box.y + offsetY - source.y * fit
  const cx = box.x + box.w / 2
  const cy = box.y + box.h / 2
  const transform = box.rotate ? `rotate(${box.rotate} ${cx} ${cy})` : undefined

  return (
    <g transform={transform}>
      <defs>
        <clipPath id={clipId}>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} />
        </clipPath>
      </defs>
      <image
        href={PREMIUM_ATLAS_URI}
        x={imageX}
        y={imageY}
        width={renderW}
        height={renderH}
        preserveAspectRatio="none"
        clipPath={`url(#${clipId})`}
      />
    </g>
  )
}

export default function Avatar2D({
  config,
  preset = 'custom',
  className = '',
  style,
}: {
  config: Avatar2DConfig
  preset?: string
  className?: string
  style?: CSSProperties
}) {
  const exactPreset = presetMap[preset]

  return (
    <svg
      className={className}
      style={style}
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      role="img"
      aria-label="Avatar premium Maître Artisan"
    >
      {exactPreset ? (
        <RasterSprite
          sprite={exactPreset}
          box={{ x: 301, y: 70, w: 520, h: 1260 }}
        />
      ) : (
        <>
          <image
            href={PREMIUM_BASE_URI}
            x="0"
            y="0"
            width={CANVAS_W}
            height={CANVAS_H}
            preserveAspectRatio="xMidYMid meet"
          />

          <RasterSprite
            sprite={bottomMap[config.bottom] ?? 'bottoms_1'}
            box={{ x: 300, y: 825, w: 520, h: 570 }}
          />

          <RasterSprite
            sprite={expressionMap[config.expression] ?? 'faces_1'}
            box={{ x: 220, y: 50, w: 680, h: 630 }}
          />

          <RasterSprite
            sprite={topMap[config.top] ?? 'tops_1'}
            box={{ x: 335, y: 565, w: 455, h: 420 }}
          />

          {hairMap[config.hair] && (
            <RasterSprite
              sprite={hairMap[config.hair]!}
              box={{ x: 190, y: 20, w: 740, h: 420 }}
            />
          )}

          {headwearMap[config.headwear] && (
            <RasterSprite
              sprite={headwearMap[config.headwear]!}
              box={{ x: 150, y: -20, w: 820, h: 390 }}
            />
          )}

          {accessoryMap[config.accessory] && (
            <RasterSprite
              sprite={accessoryMap[config.accessory]!}
              box={{ x: 275, y: 780, w: 575, h: 290 }}
            />
          )}

          {gloveMap[config.gloves] && (
            <>
              <RasterSprite
                sprite={gloveMap[config.gloves]!}
                half="left"
                box={{ x: 140, y: 760, w: 175, h: 230, rotate: -25 }}
              />
              <RasterSprite
                sprite={gloveMap[config.gloves]!}
                half="right"
                box={{ x: 807, y: 760, w: 175, h: 230, rotate: 25 }}
              />
            </>
          )}

          {shoeMap[config.shoes] && (
            <>
              <RasterSprite
                sprite={shoeMap[config.shoes]!}
                half="left"
                box={{ x: 240, y: 1140, w: 300, h: 250 }}
              />
              <RasterSprite
                sprite={shoeMap[config.shoes]!}
                half="right"
                box={{ x: 582, y: 1140, w: 300, h: 250 }}
              />
            </>
          )}
        </>
      )}
    </svg>
  )
}
