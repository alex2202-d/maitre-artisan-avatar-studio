import type { CSSProperties } from 'react'
import {
  PREMIUM_ATLAS_SIZE,
  PREMIUM_ATLAS_URI,
  PREMIUM_SPRITES,
  type PremiumSpriteKey,
} from '../premium/data'
import {
  MOOD_IMAGES,
  type MoodId,
  type MoodTradeId,
} from '../gallery/mood-images'
import {
  EXTRA_MOOD_IMAGES,
  type ExtraMoodTradeId,
} from '../gallery/mood-images-extra'
import {
  VOIRIE_MOOD_IMAGES,
  type VoirieMoodTradeId,
} from '../gallery/mood-images-voirie'

export type AvatarPresetId =
  | 'chantier'
  | 'electricien'
  | 'technicien'
  | 'peintre'
  | 'voirie'

const presetMap: Record<AvatarPresetId, PremiumSpriteKey> = {
  chantier: 'presets_1',
  electricien: 'presets_2',
  technicien: 'presets_3',
  peintre: 'presets_4',
  voirie: 'presets_5',
}

type MoodReadyPreset = MoodTradeId | ExtraMoodTradeId | VoirieMoodTradeId

function hasMoodGallery(preset: AvatarPresetId): preset is MoodReadyPreset {
  return (
    preset === 'chantier' ||
    preset === 'electricien' ||
    preset === 'technicien' ||
    preset === 'peintre' ||
    preset === 'voirie'
  )
}

function moodImage(preset: MoodReadyPreset, mood: MoodId) {
  if (preset === 'voirie') {
    return VOIRIE_MOOD_IMAGES[mood]
  }
  if (preset === 'technicien' || preset === 'peintre') {
    return EXTRA_MOOD_IMAGES[preset][mood]
  }
  return MOOD_IMAGES[preset][mood]
}

export default function Avatar2D({
  preset,
  mood = 'neutre',
  className = '',
  style,
}: {
  preset: AvatarPresetId
  mood?: MoodId
  className?: string
  style?: CSSProperties
}) {
  if (hasMoodGallery(preset)) {
    return (
      <img
        className={className}
        style={style}
        src={moodImage(preset, mood)}
        alt={`${preset} — ${mood}`}
        draggable={false}
      />
    )
  }

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
