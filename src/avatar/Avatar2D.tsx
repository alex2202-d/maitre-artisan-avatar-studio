import type { CSSProperties } from 'react'

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

type SpriteSource = 'core' | 'items'

type SpriteDef = {
  source: SpriteSource
  col: number
  row: number
}

const CORE_ATLAS = '/assets/avatar2d/wardrobe-core-v2.webp'
const ITEMS_ATLAS = '/assets/avatar2d/wardrobe-items-v2.webp'
const BASE_IMAGE = '/assets/avatar2d/base-neutral.png'

const CELL = 256
const atlasDims: Record<SpriteSource, { width: number; height: number }> = {
  core: { width: 1280, height: 768 },
  items: { width: 1280, height: 1280 },
}

const sprites: Record<string, SpriteDef> = {
  'expression-neutral': { source: 'core', col: 0, row: 0 },
  'expression-happy': { source: 'core', col: 1, row: 0 },
  'expression-determined': { source: 'core', col: 2, row: 0 },
  'expression-surprised': { source: 'core', col: 3, row: 0 },
  'expression-sad': { source: 'core', col: 4, row: 0 },

  'hair-short': { source: 'core', col: 0, row: 1 },
  'hair-side': { source: 'core', col: 1, row: 1 },
  'hair-spiky': { source: 'core', col: 2, row: 1 },
  'hair-curly': { source: 'core', col: 3, row: 1 },
  'hair-tuft': { source: 'core', col: 4, row: 1 },

  'headwear-yellow': { source: 'core', col: 0, row: 2 },
  'headwear-white': { source: 'core', col: 1, row: 2 },
  'headwear-orange': { source: 'core', col: 2, row: 2 },
  'headwear-blue': { source: 'core', col: 3, row: 2 },
  'headwear-cap-blue': { source: 'core', col: 4, row: 2 },

  'top-tank-gray': { source: 'items', col: 0, row: 0 },
  'top-tee-navy': { source: 'items', col: 1, row: 0 },
  'top-overalls-blue': { source: 'items', col: 2, row: 0 },
  'top-jacket-olive': { source: 'items', col: 3, row: 0 },
  'top-hivis-orange': { source: 'items', col: 4, row: 0 },

  'bottom-shorts-gray': { source: 'items', col: 0, row: 1 },
  'bottom-shorts-blue': { source: 'items', col: 1, row: 1 },
  'bottom-cargo-olive': { source: 'items', col: 2, row: 1 },
  'bottom-pants-dark': { source: 'items', col: 3, row: 1 },
  'bottom-painter-white': { source: 'items', col: 4, row: 1 },

  'gloves-yellow': { source: 'items', col: 0, row: 2 },
  'gloves-black': { source: 'items', col: 1, row: 2 },
  'gloves-orange': { source: 'items', col: 2, row: 2 },
  'gloves-white': { source: 'items', col: 3, row: 2 },

  'shoes-brown': { source: 'items', col: 0, row: 3 },
  'shoes-black': { source: 'items', col: 1, row: 3 },
  'shoes-white': { source: 'items', col: 2, row: 3 },
  'shoes-orange': { source: 'items', col: 3, row: 3 },
  'shoes-blue': { source: 'items', col: 4, row: 3 },

  'accessory-belt': { source: 'items', col: 0, row: 4 },
  'accessory-backpack': { source: 'items', col: 1, row: 4 },
  'accessory-tool-pouch': { source: 'items', col: 2, row: 4 },
  'accessory-tape-pouch': { source: 'items', col: 3, row: 4 },
  'accessory-harness': { source: 'items', col: 4, row: 4 },
}

const skinFilters: Record<string, string> = {
  clair: 'brightness(1.04) saturate(.93)',
  peche: 'none',
  medium: 'sepia(.12) saturate(1.08) brightness(.93)',
  brun: 'sepia(.22) saturate(1.2) brightness(.82)',
  fonce: 'sepia(.28) saturate(1.28) brightness(.72)',
}

const hairFilters: Record<string, string> = {
  brun: 'none',
  chatain: 'sepia(.16) saturate(.92) brightness(1.05)',
  blond: 'sepia(.72) saturate(1.38) brightness(1.25)',
  noir: 'saturate(.25) brightness(.52)',
  cuivre: 'sepia(.42) saturate(1.55) hue-rotate(330deg) brightness(1.02)',
}

function spriteHref(source: SpriteSource) {
  return source === 'core' ? CORE_ATLAS : ITEMS_ATLAS
}

function Sprite({
  id,
  className,
  style,
  half,
}: {
  id: string
  className?: string
  style?: CSSProperties
  half?: 'left' | 'right'
}) {
  const def = sprites[id]
  if (!def) return null

  const x = def.col * CELL
  const y = def.row * CELL
  const source = spriteHref(def.source)
  const dims = atlasDims[def.source]
  const clippedStyle: CSSProperties = { ...style, overflow: 'hidden', display: 'block' }

  if (half) {
    const halfWidth = CELL / 2
    const offsetX = half === 'right' ? halfWidth : 0
    return (
      <svg
        className={className}
        style={clippedStyle}
        viewBox={`0 0 ${halfWidth} ${CELL}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <image
          href={source}
          x={-(x + offsetX)}
          y={-y}
          width={dims.width}
          height={dims.height}
          preserveAspectRatio="none"
        />
      </svg>
    )
  }

  return (
    <svg
      className={className}
      style={clippedStyle}
      viewBox={`0 0 ${CELL} ${CELL}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <image
        href={source}
        x={-x}
        y={-y}
        width={dims.width}
        height={dims.height}
        preserveAspectRatio="none"
      />
    </svg>
  )
}

const layerBase: CSSProperties = {
  position: 'absolute',
  pointerEvents: 'none',
}

function idOrNull(prefix: string, value: string) {
  if (!value || value === 'none' || value === 'bare') return null
  return `${prefix}-${value}`
}

export default function Avatar2D({
  config,
  className = '',
  style,
}: {
  config: Avatar2DConfig
  className?: string
  style?: CSSProperties
}) {
  const expressionId = `expression-${config.expression}`
  const hairId = idOrNull('hair', config.hair)
  const headwearMap: Record<string, string | null> = {
    none: null,
    'hardhat-yellow': 'headwear-yellow',
    'hardhat-white': 'headwear-white',
    'hardhat-orange': 'headwear-orange',
    'hardhat-blue': 'headwear-blue',
    'cap-blue': 'headwear-cap-blue',
  }
  const topMap: Record<string, string> = {
    'tank-gray': 'top-tank-gray',
    'tee-navy': 'top-tee-navy',
    'overalls-blue': 'top-overalls-blue',
    'jacket-olive': 'top-jacket-olive',
    'hivis-orange': 'top-hivis-orange',
  }
  const bottomMap: Record<string, string> = {
    'shorts-gray': 'bottom-shorts-gray',
    'shorts-blue': 'bottom-shorts-blue',
    'cargo-olive': 'bottom-cargo-olive',
    'pants-dark': 'bottom-pants-dark',
    'painter-white': 'bottom-painter-white',
  }
  const glovesId = config.gloves === 'none' ? null : `gloves-${config.gloves}`
  const shoesId = config.shoes === 'bare' ? null : `shoes-${config.shoes.replace('boots-', '').replace('shoes-', '')}`
  const accessoryMap: Record<string, string | null> = {
    none: null,
    belt: 'accessory-belt',
    backpack: 'accessory-backpack',
    'tool-pouch': 'accessory-tool-pouch',
    'tape-pouch': 'accessory-tape-pouch',
    harness: 'accessory-harness',
  }

  const topId = topMap[config.top] ?? 'top-tank-gray'
  const bottomId = bottomMap[config.bottom] ?? 'bottom-shorts-gray'
  const accessoryId = accessoryMap[config.accessory] ?? null
  const headwearId = headwearMap[config.headwear] ?? null
  const skinFilter = skinFilters[config.skin] ?? skinFilters.peche
  const hairFilter = hairFilters[config.hairColor] ?? hairFilters.brun

  const accessoryStyle: CSSProperties =
    config.accessory === 'backpack'
      ? { ...layerBase, left: '29%', top: '35%', width: '42%', zIndex: 1 }
      : config.accessory === 'harness'
        ? { ...layerBase, left: '28%', top: '34%', width: '44%', zIndex: 4 }
        : config.accessory === 'tool-pouch' || config.accessory === 'tape-pouch'
          ? { ...layerBase, left: '49%', top: '49%', width: '29%', zIndex: 4 }
          : { ...layerBase, left: '24%', top: '49%', width: '52%', zIndex: 4 }

  return (
    <div
      className={`avatar2d-raster ${className}`}
      style={{
        position: 'relative',
        aspectRatio: '600 / 760',
        isolation: 'isolate',
        ...style,
      }}
      role="img"
      aria-label="Avatar Maître Artisan"
    >
      {accessoryId && config.accessory === 'backpack' && (
        <Sprite id={accessoryId} style={accessoryStyle} />
      )}

      <img
        src={BASE_IMAGE}
        alt=""
        draggable={false}
        style={{
          ...layerBase,
          left: '3.3%',
          top: '2.6%',
          width: '93.4%',
          height: '92.1%',
          objectFit: 'contain',
          filter: skinFilter,
          zIndex: 2,
        }}
      />

      <Sprite
        id={bottomId}
        style={{ ...layerBase, left: '27%', top: '51%', width: '46%', zIndex: 3 }}
      />

      <Sprite
        id={topId}
        style={{ ...layerBase, left: '28.5%', top: '35%', width: '43%', zIndex: 4 }}
      />

      {accessoryId && config.accessory !== 'backpack' && (
        <Sprite id={accessoryId} style={accessoryStyle} />
      )}

      {glovesId && (
        <>
          <Sprite
            id={glovesId}
            half="left"
            style={{ ...layerBase, left: '9%', top: '46%', width: '19%', zIndex: 5 }}
          />
          <Sprite
            id={glovesId}
            half="right"
            style={{ ...layerBase, right: '9%', top: '46%', width: '19%', zIndex: 5 }}
          />
        </>
      )}

      {shoesId && (
        <>
          <Sprite
            id={shoesId}
            half="left"
            style={{ ...layerBase, left: '22%', top: '73%', width: '23%', zIndex: 5 }}
          />
          <Sprite
            id={shoesId}
            half="right"
            style={{ ...layerBase, right: '22%', top: '73%', width: '23%', zIndex: 5 }}
          />
        </>
      )}

      <Sprite
        id={expressionId}
        style={{
          ...layerBase,
          left: '21%',
          top: '3.5%',
          width: '58%',
          filter: skinFilter,
          zIndex: 6,
        }}
      />

      {hairId && (
        <Sprite
          id={hairId}
          style={{
            ...layerBase,
            left: '18.5%',
            top: '0.3%',
            width: '63%',
            filter: hairFilter,
            zIndex: 7,
          }}
        />
      )}

      {headwearId && (
        <Sprite
          id={headwearId}
          style={{ ...layerBase, left: '15.5%', top: '-1.6%', width: '69%', zIndex: 8 }}
        />
      )}
    </div>
  )
}
