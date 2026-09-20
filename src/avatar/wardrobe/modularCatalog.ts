export type AvatarSlotId =
  | 'body'
  | 'face'
  | 'hair'
  | 'headwear'
  | 'top'
  | 'bottom'
  | 'gloves'
  | 'shoes'
  | 'accessory'

export type SlotAssetStatus = 'ready' | 'source-only' | 'missing'

export type SlotAsset = {
  id: string
  slot: AvatarSlotId
  label: string
  description: string
  modelUrl: string | null
  previewUrl: string | null
  status: SlotAssetStatus
  rigMode: 'baked' | 'skinned' | 'static'
}

export type OutfitPresetId =
  | 'outfit-chantier'
  | 'outfit-electricien'
  | 'outfit-plombier'
  | 'outfit-peintre'

export const outfitPresets: Array<{
  id: OutfitPresetId
  label: string
  description: string
}> = [
  {
    id: 'outfit-chantier',
    label: 'Chantier',
    description: 'Tenue chantier riggée de référence.',
  },
  {
    id: 'outfit-electricien',
    label: 'Électricien',
    description: 'Variante métier riggée électricien.',
  },
  {
    id: 'outfit-plombier',
    label: 'Plombier',
    description: 'Variante métier riggée plombier.',
  },
  {
    id: 'outfit-peintre',
    label: 'Peintre',
    description: 'Variante métier riggée peintre.',
  },
]

export function getOutfitModelUrl(
  presetId: OutfitPresetId | string,
  skinToneId: string,
) {
  const safePreset = outfitPresets.some((preset) => preset.id === presetId)
    ? presetId
    : 'outfit-chantier'

  return `/assets/avatar/v2/outfits/${safePreset}/avatar_${safePreset}_${skinToneId}.glb`
}

/**
 * Source inventory for the real modular GLBs already present in the repository.
 *
 * They are intentionally marked source-only: the inspection workflow proved that
 * these meshes have no skin/rig and are centred in their own local coordinate
 * system. Enabling them over the current monolithic dressed body would duplicate
 * geometry and create clipping. They remain first-class slot assets so the
 * runtime can activate them as soon as a neutral body / shared rig is available.
 */
export const modularSlotAssets: SlotAsset[] = [
  {
    id: 'face-base-v3',
    slot: 'face',
    label: 'Visage original 3D',
    description: 'Visage réellement texturé dans le GLB riggé. Aucun overlay.',
    modelUrl: null,
    previewUrl: '/assets/avatar/v2/previews/avatar_workwear_v2.png',
    status: 'ready',
    rigMode: 'baked',
  },
  {
    id: 'hair-none',
    slot: 'hair',
    label: 'Sans cheveux',
    description: 'Aucun mesh de coiffure actif.',
    modelUrl: null,
    previewUrl: null,
    status: 'ready',
    rigMode: 'baked',
  },
  {
    id: 'headwear-hardhat-v2',
    slot: 'headwear',
    label: 'Casque chantier jaune',
    description: 'GLB 3D séparé présent. À raccorder au bone Head avant activation.',
    modelUrl: '/assets/avatar/v2/outfit01/headwear_hardhat_v2.glb',
    previewUrl: '/assets/avatar/v2/previews/headwear_hardhat_v2.png',
    status: 'source-only',
    rigMode: 'static',
  },
  {
    id: 'top-workwear-v2',
    slot: 'top',
    label: 'Haut chantier',
    description: 'GLB 3D séparé présent. À skinner sur le rig partagé avant activation.',
    modelUrl: '/assets/avatar/v2/outfit01/top_workwear_v2.glb',
    previewUrl: '/assets/avatar/v2/previews/top_workwear_v2.png',
    status: 'source-only',
    rigMode: 'static',
  },
  {
    id: 'bottom-workshort-v2',
    slot: 'bottom',
    label: 'Bas chantier',
    description: 'GLB 3D séparé présent. À skinner sur le rig partagé avant activation.',
    modelUrl: '/assets/avatar/v2/outfit01/bottom_workshort_v2.glb',
    previewUrl: '/assets/avatar/v2/previews/bottom_workshort_v2.png',
    status: 'source-only',
    rigMode: 'static',
  },
  {
    id: 'gloves-work-v2',
    slot: 'gloves',
    label: 'Gants chantier',
    description: 'Paire de gants 3D présente. À rattacher aux mains avant activation.',
    modelUrl: '/assets/avatar/v2/outfit01/gloves_work_v2.glb',
    previewUrl: '/assets/avatar/v2/previews/gloves_work_v2.png',
    status: 'source-only',
    rigMode: 'static',
  },
  {
    id: 'shoes-work-boots-v2',
    slot: 'shoes',
    label: 'Chaussures de sécurité',
    description: 'Paire de chaussures 3D présente. À rattacher aux pieds avant activation.',
    modelUrl: '/assets/avatar/v2/outfit01/shoes_work_boots_v2.glb',
    previewUrl: '/assets/avatar/v2/previews/shoes_work_boots_v2.png',
    status: 'source-only',
    rigMode: 'static',
  },
  {
    id: 'accessory-none',
    slot: 'accessory',
    label: 'Aucun accessoire',
    description: 'Aucun accessoire métier actif.',
    modelUrl: null,
    previewUrl: null,
    status: 'ready',
    rigMode: 'baked',
  },
]

export const modularSlotAssetById = new Map(
  modularSlotAssets.map((asset) => [asset.id, asset]),
)

export function getSlotAssets(slot: AvatarSlotId) {
  return modularSlotAssets.filter((asset) => asset.slot === slot)
}
