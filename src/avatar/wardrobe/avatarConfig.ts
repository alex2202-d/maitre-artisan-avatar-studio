import type { OutfitPresetId } from './modularCatalog'

export type AvatarGender = 'male' | 'female'

export type AvatarConfigV3 = {
  version: 3
  bodyType: AvatarGender
  skinToneId: string
  faceId: string
  hairStyleId: string
  hairColorId: string
  outfitPresetId: OutfitPresetId
  outfit: {
    headwearId: string | null
    topId: string | null
    bottomId: string | null
    glovesId: string | null
    shoesId: string | null
    accessoryId: string | null
  }
}

export const AVATAR_STORAGE_KEY = 'maitre-artisan-avatar-v3'
const LEGACY_AVATAR_STORAGE_KEY = 'maitre-artisan-avatar-v2'

export const defaultAvatarConfigV3: AvatarConfigV3 = {
  version: 3,
  bodyType: 'male',
  skinToneId: 'skin-medium',
  faceId: 'face-base-v3',
  hairStyleId: 'hair-none',
  hairColorId: 'hair-dark',
  outfitPresetId: 'outfit-chantier',
  outfit: {
    headwearId: null,
    topId: null,
    bottomId: null,
    glovesId: null,
    shoesId: null,
    accessoryId: null,
  },
}

function normalizeV3(parsed: Partial<AvatarConfigV3>): AvatarConfigV3 {
  return {
    ...defaultAvatarConfigV3,
    ...parsed,
    version: 3,
    faceId: 'face-base-v3',
    hairStyleId: parsed.hairStyleId ?? defaultAvatarConfigV3.hairStyleId,
    outfitPresetId: parsed.outfitPresetId ?? defaultAvatarConfigV3.outfitPresetId,
    outfit: {
      ...defaultAvatarConfigV3.outfit,
      ...(parsed.outfit ?? {}),
    },
  }
}

function migrateV2(raw: string): AvatarConfigV3 | null {
  try {
    const parsed = JSON.parse(raw) as {
      version?: number
      bodyType?: AvatarGender
      skinToneId?: string
      hairStyleId?: string
      hairColorId?: string
    }

    if (parsed.version !== 2) return null

    return normalizeV3({
      bodyType: parsed.bodyType,
      skinToneId: parsed.skinToneId,
      hairStyleId: parsed.hairStyleId,
      hairColorId: parsed.hairColorId,
    })
  } catch {
    return null
  }
}

export function loadAvatarConfigV3(): AvatarConfigV3 {
  try {
    const raw = localStorage.getItem(AVATAR_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AvatarConfigV3>
      if (parsed.version === 3) return normalizeV3(parsed)
    }

    const legacyRaw = localStorage.getItem(LEGACY_AVATAR_STORAGE_KEY)
    if (legacyRaw) {
      const migrated = migrateV2(legacyRaw)
      if (migrated) return migrated
    }
  } catch {
    // Fall through to the production defaults.
  }

  return defaultAvatarConfigV3
}

export function saveAvatarConfigV3(config: AvatarConfigV3) {
  localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(config))
}
