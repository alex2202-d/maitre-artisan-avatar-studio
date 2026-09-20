import {
  outfit01Assets,
  productionCharacter,
  type ProductionAsset,
} from '../productionCatalog'
import {
  getSlotAssets,
  modularSlotAssetById,
  outfitPresets,
  type AvatarSlotId,
} from './modularCatalog'

export type WardrobeCategoryId =
  | 'character'
  | 'skin'
  | 'outfit'
  | 'face'
  | 'hair'
  | 'headwear'
  | 'top'
  | 'bottom'
  | 'gloves'
  | 'shoes'
  | 'accessory'

export type WardrobeCategory = {
  id: WardrobeCategoryId
  label: string
  icon: string
  assetId: string
}

export const wardrobeCategories: WardrobeCategory[] = [
  { id: 'character', label: 'Avatar', icon: '●', assetId: productionCharacter.id },
  { id: 'skin', label: 'Peau', icon: '◉', assetId: productionCharacter.id },
  { id: 'outfit', label: 'Tenue', icon: '◆', assetId: productionCharacter.id },
  { id: 'face', label: 'Visage', icon: '◌', assetId: productionCharacter.id },
  { id: 'hair', label: 'Coiffure', icon: '≈', assetId: productionCharacter.id },
  { id: 'headwear', label: 'Casque', icon: '⌒', assetId: 'headwear-hardhat-v2' },
  { id: 'top', label: 'Haut', icon: '▣', assetId: 'top-workwear-v2' },
  { id: 'bottom', label: 'Bas', icon: '▥', assetId: 'bottom-workshort-v2' },
  { id: 'gloves', label: 'Gants', icon: '✦', assetId: 'gloves-work-v2' },
  { id: 'shoes', label: 'Chaussures', icon: '◒', assetId: 'shoes-work-boots-v2' },
  { id: 'accessory', label: 'Accessoire', icon: '+', assetId: productionCharacter.id },
]

export const wardrobeAssets: ProductionAsset[] = [productionCharacter, ...outfit01Assets]

export const wardrobeAssetById = new Map(wardrobeAssets.map((asset) => [asset.id, asset]))

export const skinTones = [
  { id: 'skin-light', label: 'Clair', color: '#E7C7AE' },
  { id: 'skin-light-medium', label: 'Clair moyen', color: '#D8A582' },
  { id: 'skin-medium', label: 'Moyen', color: '#BC7F58' },
  { id: 'skin-tan', label: 'Mat', color: '#8E5D3F' },
  { id: 'skin-dark', label: 'Foncé', color: '#5F3526' },
] as const

export const faceOptions = [
  {
    id: 'face-base-v3',
    label: 'Original 3D',
    description: 'Visage du mesh riggé, sans filtre, overlay ni patch shader.',
  },
] as const

export const hairColors = [
  { id: 'hair-dark', label: 'Noir', color: '#201A18' },
  { id: 'hair-brown', label: 'Brun', color: '#4A3025' },
  { id: 'hair-chestnut', label: 'Châtain', color: '#79513A' },
  { id: 'hair-blond', label: 'Blond', color: '#D5B06D' },
  { id: 'hair-red', label: 'Roux', color: '#A95834' },
] as const

export const plannedHairStyles = [
  { id: 'hair-none', label: 'Sans cheveux' },
] as const

export { outfitPresets }

export function categoryToSlot(category: WardrobeCategoryId): AvatarSlotId | null {
  if (
    category === 'face' ||
    category === 'hair' ||
    category === 'headwear' ||
    category === 'top' ||
    category === 'bottom' ||
    category === 'gloves' ||
    category === 'shoes' ||
    category === 'accessory'
  ) {
    return category
  }
  return null
}

export function sourceAssetsForCategory(category: WardrobeCategoryId) {
  const slot = categoryToSlot(category)
  return slot ? getSlotAssets(slot) : []
}

export { modularSlotAssetById }
