import { useCallback, useEffect, useState } from 'react'
import {
  defaultAvatarConfigV3,
  loadAvatarConfigV3,
  saveAvatarConfigV3,
  type AvatarConfigV3,
} from './avatarConfig'
import {
  accessoryOptions,
  bottomOptions,
  faceOptions,
  gloveOptions,
  hairColors,
  hairOptions,
  headwearOptions,
  outfitPresets,
  shoeOptions,
  skinTones,
  topOptions,
} from './wardrobeCatalog'

function choose<T>(values: readonly T[]) {
  return values[Math.floor(Math.random() * values.length)]
}

export function useAvatarConfig() {
  const [config, setConfig] = useState<AvatarConfigV3>(() => loadAvatarConfigV3())

  useEffect(() => {
    saveAvatarConfigV3(config)
  }, [config])

  const reset = useCallback(() => setConfig(defaultAvatarConfigV3), [])

  const randomize = useCallback(() => {
    setConfig((current) => ({
      ...current,
      skinToneId: choose(skinTones).id,
      faceId: choose(faceOptions).id,
      hairStyleId: choose(hairOptions).id,
      hairColorId: choose(hairColors).id,
      outfitPresetId: choose(outfitPresets).id,
      outfit: {
        headwearId: choose(headwearOptions).id,
        topId: choose(topOptions).id,
        bottomId: choose(bottomOptions).id,
        glovesId: choose(gloveOptions).id,
        shoesId: choose(shoeOptions).id,
        accessoryId: choose(accessoryOptions).id,
      },
    }))
  }, [])

  const update = useCallback((patch: Partial<AvatarConfigV3>) => {
    setConfig((current) => ({
      ...current,
      ...patch,
      outfit: patch.outfit ? { ...current.outfit, ...patch.outfit } : current.outfit,
      version: 3,
    }))
  }, [])

  const save = useCallback(() => saveAvatarConfigV3(config), [config])

  return { config, update, reset, randomize, save }
}
