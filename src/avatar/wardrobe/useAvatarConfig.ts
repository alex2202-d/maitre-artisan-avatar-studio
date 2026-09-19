import { useCallback, useEffect, useState } from 'react'
import {
  defaultAvatarConfigV2,
  loadAvatarConfigV2,
  saveAvatarConfigV2,
  type AvatarConfigV2,
} from './avatarConfig'

function choose<T>(values: readonly T[]) {
  return values[Math.floor(Math.random() * values.length)]
}

export function useAvatarConfig() {
  const [config, setConfig] = useState<AvatarConfigV2>(() => loadAvatarConfigV2())

  useEffect(() => {
    saveAvatarConfigV2(config)
  }, [config])

  const reset = useCallback(() => {
    setConfig(defaultAvatarConfigV2)
  }, [])

  const randomize = useCallback(() => {
    setConfig((current) => ({
      ...current,
      skinToneId: choose(['skin-light', 'skin-light-medium', 'skin-medium', 'skin-tan', 'skin-dark'] as const),
      hairColorId: choose(['hair-dark', 'hair-brown', 'hair-chestnut', 'hair-blond', 'hair-red'] as const),
      outfit: {
        ...defaultAvatarConfigV2.outfit,
        topId: choose(['top-workwear-v2', 'top-anthracite-v2', 'top-blue-v2', 'top-light-v2'] as const),
        bottomId: choose(['bottom-workshort-v2', 'bottom-anthracite-v2', 'bottom-blue-v2', 'bottom-light-v2'] as const),
      },
    }))
  }, [])

  const update = useCallback((patch: Partial<AvatarConfigV2>) => {
    setConfig((current) => ({
      ...current,
      ...patch,
      outfit: patch.outfit ? { ...current.outfit, ...patch.outfit } : current.outfit,
      version: 2,
    }))
  }, [])

  const save = useCallback(() => {
    saveAvatarConfigV2(config)
  }, [config])

  return { config, update, reset, randomize, save }
}
