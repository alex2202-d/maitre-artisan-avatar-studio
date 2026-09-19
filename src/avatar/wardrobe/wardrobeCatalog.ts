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
  { id: 'skin-light', label: 'Clair', color: '#E7C7AE' },
  { id: 'skin-light-medium', label: 'Clair moyen', color: '#D8A582' },
  { id: 'skin-medium', label: 'Moyen', color: '#BC7F58' },
  { id: 'skin-tan', label: 'Mat', color: '#8E5D3F' },
  { id: 'skin-dark', label: 'Foncé', color: '#5F3526' },
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


export const topOptions = [
  {
    id: 'top-workwear-v2',
    label: 'Marine',
    description: 'Haut de travail marine avec accents orange.',
    color: '#172036',
  },
  {
    id: 'top-anthracite-v2',
    label: 'Anthracite',
    description: 'Haut de travail anthracite avec accents orange.',
    color: '#2A2C32',
  },
  {
    id: 'top-blue-v2',
    label: 'Bleu',
    description: 'Haut de travail bleu avec accents orange.',
    color: '#264E84',
  },
  {
    id: 'top-light-v2',
    label: 'Clair',
    description: 'Haut de travail clair avec accents orange.',
    color: '#D8D5CE',
  },
] as const

export const bottomOptions = [
  {
    id: 'bottom-workshort-v2',
    label: 'Marine',
    description: 'Bas de travail marine avec accents orange.',
    color: '#172036',
  },
  {
    id: 'bottom-anthracite-v2',
    label: 'Anthracite',
    description: 'Bas de travail anthracite avec accents orange.',
    color: '#2A2C32',
  },
  {
    id: 'bottom-blue-v2',
    label: 'Bleu',
    description: 'Bas de travail bleu avec accents orange.',
    color: '#264E84',
  },
  {
    id: 'bottom-light-v2',
    label: 'Clair',
    description: 'Bas de travail clair avec accents orange.',
    color: '#D8D5CE',
  },
] as const
