import {
  outfit01Assets,
  productionCharacter,
  type ProductionAsset,
} from '../productionCatalog'

export type WardrobeCategoryId =
  | 'character'
  | 'skin'
  | 'headwear'
  | 'top'
  | 'bottom'
  | 'gloves'
  | 'shoes'

export type WardrobeCategory = {
  id: WardrobeCategoryId
  label: string
  icon: string
  assetId: string
}

export const wardrobeCategories: WardrobeCategory[] = [
  { id: 'character', label: 'Avatar', icon: '●', assetId: productionCharacter.id },
  { id: 'skin', label: 'Peau', icon: '◉', assetId: productionCharacter.id },
  { id: 'headwear', label: 'Casque', icon: '⌒', assetId: 'headwear-hardhat-v2' },
  { id: 'top', label: 'Haut', icon: '▣', assetId: 'top-workwear-v2' },
  { id: 'bottom', label: 'Bas', icon: '▥', assetId: 'bottom-workshort-v2' },
  { id: 'gloves', label: 'Gants', icon: '✦', assetId: 'gloves-work-v2' },
  { id: 'shoes', label: 'Chaussures', icon: '◒', assetId: 'shoes-work-boots-v2' },
]

export const wardrobeAssets: ProductionAsset[] = [productionCharacter, ...outfit01Assets]

export const wardrobeAssetById = new Map(wardrobeAssets.map((asset) => [asset.id, asset]))

export const skinTones = [
  { id: 'skin-light', label: 'Clair', color: '#F1D2BC' },
  { id: 'skin-light-medium', label: 'Clair moyen', color: '#D7AD8B' },
  { id: 'skin-medium', label: 'Moyen', color: '#BC8665' },
  { id: 'skin-tan', label: 'Mat', color: '#87583F' },
  { id: 'skin-dark', label: 'Foncé', color: '#563625' },
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
  { id: 'hair-short', label: 'Court' },
  { id: 'hair-tuft', label: 'Mèche' },
  { id: 'hair-side', label: 'Côté' },
] as const
