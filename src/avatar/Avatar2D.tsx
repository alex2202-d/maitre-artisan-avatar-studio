import type { CSSProperties } from 'react'
import {
  PREMIUM_ATLAS_SIZE,
  PREMIUM_ATLAS_URI,
  PREMIUM_SPRITES,
  type PremiumSpriteKey,
} from '../premium/data'

export type AvatarPresetId =
  | 'chantier'
  | 'electricien'
  | 'technicien'
  | 'peintre'
  | 'voirie'

export type Avatar2DConfig = Record<string, never>

const presetMap: Record<AvatarPresetId, PremiumSpriteKey> = {
  chantier: 'presets_1',
  electricien: 'presets_2',
  technicien: 'presets_3',
  peintre: 'presets_4',
  voirie: 'presets_5',
}

export default function Avatar2D({
  preset,
  className = '',
  style,
}: {
  preset: AvatarPresetId
  className?: string
  style?: CSSProperties
}) {
  const sprite = presetMap[preset]
  const rect = PREMIUM_SPRITES[sprite]

  return (
    <svg
      className={className}
      style={style}
      viewBox={`0 0 ${rect.w} ${rect.h}`}
      role="img"
      aria-label={`Avatar complet ${preset}`}
    >
      <svg
        x="0"
        y="0"
        width={rect.w}
        height={rect.h}
        viewBox={`${rect.x} ${rect.y} ${rect.w} ${rect.h}`}
        preserveAspectRatio="xMidYMid meet"
        overflow="hidden"
      >
        <image
          href={PREMIUM_ATLAS_URI}
          x="0"
          y="0"
          width={PREMIUM_ATLAS_SIZE.width}
          height={PREMIUM_ATLAS_SIZE.height}
          preserveAspectRatio="none"
        />
      </svg>
    </svg>
  )
}
