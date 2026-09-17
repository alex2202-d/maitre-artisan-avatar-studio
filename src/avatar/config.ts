import { defaultAvatarConfig, type AvatarConfig } from './types'

const STORAGE_KEY = 'maitre-artisan-avatar-studio:v1'

export function loadAvatarConfig(): AvatarConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultAvatarConfig

    const parsed = JSON.parse(raw) as Partial<AvatarConfig> & {
      beanie?: boolean
      beanieColor?: string
    }

    return {
      ...defaultAvatarConfig,
      ...parsed,
      version: 1,
      headwear:
        parsed.headwear ??
        (parsed.beanie === true ? 'beanie' : parsed.beanie === false ? 'none' : defaultAvatarConfig.headwear),
      headwearColor: parsed.headwearColor ?? parsed.beanieColor ?? defaultAvatarConfig.headwearColor,
    }
  } catch {
    return defaultAvatarConfig
  }
}

export function saveAvatarConfig(config: AvatarConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function serializeAvatarConfig(config: AvatarConfig) {
  return JSON.stringify(config, null, 2)
}
