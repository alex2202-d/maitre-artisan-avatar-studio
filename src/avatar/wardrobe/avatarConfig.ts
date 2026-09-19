export type AvatarGender = 'male' | 'female'

export type AvatarConfigV2 = {
  version: 2
  bodyType: AvatarGender
  skinToneId: string
  hairStyleId: string
  hairColorId: string
  outfitId: string
  outfit: {
    headwearId: string | null
    topId: string | null
    bottomId: string | null
    glovesId: string | null
    shoesId: string | null
  }
}

export const AVATAR_STORAGE_KEY = 'maitre-artisan-avatar-v2'

export const defaultAvatarConfigV2: AvatarConfigV2 = {
  version: 2,
  bodyType: 'male',
  skinToneId: 'skin-medium',
  hairStyleId: 'hair-none',
  hairColorId: 'hair-dark',
  outfitId: 'outfit-chantier',
  outfit: {
    headwearId: 'headwear-hardhat-v2',
    topId: 'top-workwear-v2',
    bottomId: 'bottom-workshort-v2',
    glovesId: 'gloves-work-v2',
    shoesId: 'shoes-work-boots-v2',
  },
}

export function loadAvatarConfigV2(): AvatarConfigV2 {
  try {
    const raw = localStorage.getItem(AVATAR_STORAGE_KEY)
    if (!raw) return defaultAvatarConfigV2

    const parsed = JSON.parse(raw) as Partial<AvatarConfigV2>
    if (parsed.version !== 2) return defaultAvatarConfigV2

    return {
      ...defaultAvatarConfigV2,
      ...parsed,
      version: 2,
      outfit: {
        ...defaultAvatarConfigV2.outfit,
        ...(parsed.outfit ?? {}),
      },
    }
  } catch {
    return defaultAvatarConfigV2
  }
}

export function saveAvatarConfigV2(config: AvatarConfigV2) {
  localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(config))
}
