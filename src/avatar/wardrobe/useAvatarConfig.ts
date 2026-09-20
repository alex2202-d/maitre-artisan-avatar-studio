import { useCallback, useEffect, useState } from 'react'
import {
  defaultAvatarConfigV3,
  loadAvatarConfigV3,
  saveAvatarConfigV3,
  type AvatarConfigV3,
} from './avatarConfig'
import { outfitPresets } from './modularCatalog'

function choose<T>(values: readonly T[]) {
  return values[Math.floor(Math.random() * values.length)]
}

export function useAvatarConfig() {
  const [config, setConfig] = useState<AvatarConfigV3>(() => loadAvatarConfigV3())

  useEffect(() => {
    saveAvatarConfigV3(config)
  }, [config])

  const reset = useCallback(() => {
    setConfig(defaultAvatarConfigV3)
  }, [])

  const randomize = useCallback(() => {
    setConfig((current) => ({
      ...current,
      skinToneId: choose([
        'skin-light',
        'skin-light-medium',
        'skin-medium',
        'skin-tan',
        'skin-dark',
      ] as const),
      faceId: 'face-base-v3',
      outfitPresetId: choose(outfitPresets.map((preset) => preset.id)),
      outfit: {
        ...defaultAvatarConfigV3.outfit,
      },
    }))
  }, [])

  const update = useCallback((patch: Partial<AvatarConfigV3>) => {
    setConfig((current) => ({
      ...current,
      ...patch,
      outfit: patch.outfit ? { ...current.outfit, ...patch.outfit } : current.outfit,
      version: 3,
      faceId: 'face-base-v3',
    }))
  }, [])

  const save = useCallback(() => {
    saveAvatarConfigV3(config)
  }, [config])

  return { config, update, reset, randomize, save }
}
