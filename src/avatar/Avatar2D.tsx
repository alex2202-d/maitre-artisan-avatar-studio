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

type AtlasDef = { col: number; row: number }

const BASE_ATLAS = '/assets/avatar2d/avatar-bases-atlas-portrait.webp'
const LAYERS_ATLAS = '/assets/avatar2d/wardrobe-layers-atlas-portrait.webp'
const PRESET_ATLAS = '/assets/avatar2d/wardrobe-presets.webp'

const CELL_W = 600
const CELL_H = 760

const skinRows: Record<string, number> = {
  clair: 0,
  peche: 1,
  medium: 2,
  brun: 3,
  fonce: 4,
}

const expressionCols: Record<string, number> = {
  neutral: 0,
  happy: 1,
  determined: 2,
  surprised: 3,
  sad: 4,
}

const layers: Record<string, AtlasDef> = {
  'hair-short': { col: 0, row: 0 },
  'hair-side': { col: 1, row: 0 },
  'hair-spiky': { col: 2, row: 0 },
  'hair-curly': { col: 3, row: 0 },
  'hair-classic': { col: 4, row: 0 },
  'hair-bob': { col: 5, row: 0 },

  'headwear-hardhat-yellow': { col: 0, row: 1 },
  'headwear-hardhat-blue': { col: 1, row: 1 },
  'headwear-hardhat-orange': { col: 2, row: 1 },
  'headwear-cap-white': { col: 3, row: 1 },
  'headwear-cap-gray': { col: 4, row: 1 },
  'headwear-beanie': { col: 5, row: 1 },

  'top-tank-gray': { col: 0, row: 2 },
  'top-tee-navy': { col: 1, row: 2 },
  'top-jacket-blue': { col: 2, row: 2 },
  'top-jacket-olive': { col: 3, row: 2 },
  'top-painter-top': { col: 4, row: 2 },
  'top-hivis-orange': { col: 5, row: 2 },

  'bottom-shorts-gray': { col: 0, row: 3 },
  'bottom-overalls-blue': { col: 1, row: 3 },
  'bottom-pants-blue': { col: 2, row: 3 },
  'bottom-cargo-olive': { col: 3, row: 3 },
  'bottom-painter-pants': { col: 4, row: 3 },
  'bottom-cargo-dark': { col: 5, row: 3 },

  'gloves-yellow': { col: 0, row: 4 },
  'gloves-black': { col: 1, row: 4 },
  'gloves-orange': { col: 2, row: 4 },
  'gloves-white': { col: 3, row: 4 },
  'gloves-blue': { col: 4, row: 4 },

  'shoes-boots-brown': { col: 0, row: 5 },
  'shoes-boots-black': { col: 1, row: 5 },
  'shoes-boots-white': { col: 2, row: 5 },
  'shoes-boots-orange': { col: 3, row: 5 },
  'shoes-shoes-blue': { col: 4, row: 5 },

  'accessory-belt-brown': { col: 0, row: 6 },
  'accessory-belt-electric': { col: 1, row: 6 },
  'accessory-belt-mechanic': { col: 2, row: 6 },
  'accessory-belt-painter': { col: 3, row: 6 },
  'accessory-harness': { col: 4, row: 6 },
  'accessory-pouch-orange': { col: 5, row: 6 },
}

const hairFilters: Record<string, string> = {
  brun: 'none',
  chatain: 'sepia(.16) saturate(.92) brightness(1.05)',
  blond: 'sepia(.72) saturate(1.38) brightness(1.25)',
  noir: 'saturate(.25) brightness(.52)',
  cuivre: 'sepia(.42) saturate(1.55) hue-rotate(330deg) brightness(1.02)',
}

const presetColumns: Record<string, number> = {
  chantier: 0,
  electricien: 1,
  technicien: 2,
  peintre: 3,
  voirie: 4,
}

function AtlasCell({
  source,
  sourceWidth,
  sourceHeight,
  col,
  row,
  style,
  filter,
}: {
  source: string
  sourceWidth: number
  sourceHeight: number
  col: number
  row: number
  style?: CSSProperties
  filter?: string
}) {
  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        overflow: 'hidden',
        pointerEvents: 'none',
        filter,
        ...style,
      }}
      viewBox={`0 0 ${CELL_W} ${CELL_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <image
        href={source}
        x={-col * CELL_W}
        y={-row * CELL_H}
        width={sourceWidth}
        height={sourceHeight}
        preserveAspectRatio="none"
      />
    </svg>
  )
}

function PresetSprite({ preset }: { preset: string }) {
  const col = presetColumns[preset]
  if (col === undefined) return null

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden', display: 'block' }}
      viewBox="0 0 320 640"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <image
        href={PRESET_ATLAS}
        x={-col * 320}
        y={0}
        width={1600}
        height={640}
        preserveAspectRatio="none"
      />
    </svg>
  )
}

function Layer({ id, filter }: { id: string; filter?: string }) {
  const def = layers[id]
  if (!def) return null

  return (
    <AtlasCell
      source={LAYERS_ATLAS}
      sourceWidth={3600}
      sourceHeight={5320}
      col={def.col}
      row={def.row}
      filter={filter}
    />
  )
}

export default function Avatar2D({
  config,
  className = '',
  style,
  preset,
}: {
  config: Avatar2DConfig
  className?: string
  style?: CSSProperties
  preset?: string | null
}) {
  const wrapperStyle: CSSProperties = {
    position: 'relative',
    aspectRatio: '600 / 760',
    isolation: 'isolate',
    overflow: 'visible',
    ...style,
  }

  if (preset && preset !== 'custom' && presetColumns[preset] !== undefined) {
    return (
      <div
        className={`avatar2d-raster ${className}`}
        style={wrapperStyle}
        role="img"
        aria-label={`Avatar Maître Artisan - ${preset}`}
      >
        <PresetSprite preset={preset} />
      </div>
    )
  }

  const skinRow = skinRows[config.skin] ?? skinRows.peche
  const expressionCol = expressionCols[config.expression] ?? expressionCols.neutral
  const hairFilter = hairFilters[config.hairColor] ?? hairFilters.brun

  return (
    <div
      className={`avatar2d-raster ${className}`}
      style={wrapperStyle}
      role="img"
      aria-label="Avatar Maître Artisan personnalisé"
    >
      <AtlasCell
        source={BASE_ATLAS}
        sourceWidth={3000}
        sourceHeight={3800}
        col={expressionCol}
        row={skinRow}
      />

      {config.bottom !== 'none' && <Layer id={`bottom-${config.bottom}`} />}
      {config.top !== 'none' && <Layer id={`top-${config.top}`} />}

      {config.accessory !== 'none' && <Layer id={`accessory-${config.accessory}`} />}
      {config.gloves !== 'none' && <Layer id={`gloves-${config.gloves}`} />}
      {config.shoes !== 'bare' && <Layer id={`shoes-${config.shoes}`} />}

      {config.hair !== 'none' && (
        <Layer id={`hair-${config.hair}`} filter={hairFilter} />
      )}

      {config.headwear !== 'none' && <Layer id={`headwear-${config.headwear}`} />}
    </div>
  )
}
