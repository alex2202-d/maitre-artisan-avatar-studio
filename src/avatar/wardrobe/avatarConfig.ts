export type AvatarGender = 'male' | 'female'

export type AvatarConfigV2 = {
  version: 2
  bodyType: AvatarGender
  skinToneId: string
  faceId: string
  hairStyleId: string
  hairColorId: string
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
  faceId: 'face-classic',
  hairStyleId: 'hair-none',
  hairColorId: 'hair-dark',
  outfit: {
    headwearId: 'headwear-hardhat-v2',
    topId: 'top-red-v2',
    bottomId: 'bottom-red-v2',
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

    const migratedTopIds: Record<string, string> = {
      'top-workwear-v2': 'top-red-v2',
      'top-anthracite-v2': 'top-blue-v2',
      'top-blue-v2': 'top-yellow-v2',
      'top-light-v2': 'top-green-v2',
    }
    const migratedBottomIds: Record<string, string> = {
      'bottom-workshort-v2': 'bottom-red-v2',
      'bottom-anthracite-v2': 'bottom-blue-v2',
      'bottom-blue-v2': 'bottom-yellow-v2',
      'bottom-light-v2': 'bottom-green-v2',
    }

    const mergedOutfit = {
      ...defaultAvatarConfigV2.outfit,
      ...(parsed.outfit ?? {}),
    }

    return {
      ...defaultAvatarConfigV2,
      ...parsed,
      faceId: parsed.faceId ?? defaultAvatarConfigV2.faceId,
      version: 2,
      outfit: {
        ...mergedOutfit,
        topId: mergedOutfit.topId ? (migratedTopIds[mergedOutfit.topId] ?? mergedOutfit.topId) : defaultAvatarConfigV2.outfit.topId,
        bottomId: mergedOutfit.bottomId ? (migratedBottomIds[mergedOutfit.bottomId] ?? mergedOutfit.bottomId) : defaultAvatarConfigV2.outfit.bottomId,
      },
    }
  } catch {
    return defaultAvatarConfigV2
  }
}

export function saveAvatarConfigV2(config: AvatarConfigV2) {
  localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(config))
}
