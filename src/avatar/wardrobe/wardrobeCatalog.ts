import {
  outfit01Assets,
  productionCharacter,
  type ProductionAsset,
} from '../productionCatalog'
import { outfitPresets } from './modularCatalog'

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
  { id: 'face-classic-3d', label: 'Classique', description: 'Visage 3D neutre.' },
  { id: 'face-smile-3d', label: 'Souriant', description: 'Sourire 3D simple.' },
  { id: 'face-determined-3d', label: 'Déterminé', description: 'Expression 3D concentrée.' },
  { id: 'face-surprised-3d', label: 'Surpris', description: 'Expression 3D surprise.' },
] as const

export const hairColors = [
  { id: 'hair-dark', label: 'Noir', color: '#201A18' },
  { id: 'hair-brown', label: 'Brun', color: '#4A3025' },
  { id: 'hair-chestnut', label: 'Châtain', color: '#79513A' },
  { id: 'hair-blond', label: 'Blond', color: '#D5B06D' },
  { id: 'hair-red', label: 'Roux', color: '#A95834' },
] as const

export const hairOptions = [
  { id: 'hair-none', label: 'Rasé', description: 'Sans cheveux.' },
  { id: 'hair-short-3d', label: 'Court', description: 'Coupe courte 3D compacte.' },
  { id: 'hair-tuft-3d', label: 'Mèche', description: 'Mèche 3D stylisée.' },
  { id: 'hair-side-3d', label: 'Côté', description: 'Coupe 3D sur le côté.' },
] as const

export const headwearOptions = [
  { id: 'helmet-none', label: 'Aucun', color: '#D7D7D2' },
  { id: 'helmet-yellow', label: 'Jaune', color: '#F4C430' },
  { id: 'helmet-blue', label: 'Bleu', color: '#2468C9' },
  { id: 'helmet-red', label: 'Rouge', color: '#D93636' },
  { id: 'helmet-white', label: 'Blanc', color: '#ECEBE6' },
] as const

export const topOptions = [
  { id: 'top-blue-v3', label: 'Bleu', color: '#1457A6' },
  { id: 'top-red-v3', label: 'Rouge', color: '#C93B35' },
  { id: 'top-green-v3', label: 'Vert', color: '#2F7A50' },
  { id: 'top-charcoal-v3', label: 'Anthracite', color: '#34383F' },
] as const

export const bottomOptions = [
  { id: 'bottom-blue-v3', label: 'Bleu', color: '#1457A6' },
  { id: 'bottom-red-v3', label: 'Rouge', color: '#C93B35' },
  { id: 'bottom-green-v3', label: 'Vert', color: '#2F7A50' },
  { id: 'bottom-charcoal-v3', label: 'Anthracite', color: '#34383F' },
] as const

export const gloveOptions = [
  { id: 'gloves-yellow-v3', label: 'Jaune', color: '#F4C430' },
  { id: 'gloves-orange-v3', label: 'Orange', color: '#D97A22' },
  { id: 'gloves-black-v3', label: 'Noir', color: '#24272C' },
  { id: 'gloves-blue-v3', label: 'Bleu', color: '#2E68B4' },
] as const

export const shoeOptions = [
  { id: 'shoes-brown-v3', label: 'Marron', color: '#8A431F' },
  { id: 'shoes-black-v3', label: 'Noir', color: '#27282A' },
  { id: 'shoes-tan-v3', label: 'Camel', color: '#B36B32' },
] as const

export const accessoryOptions = [
  { id: 'accessory-none', label: 'Aucun', description: 'Sans accessoire.' },
  { id: 'accessory-toolbelt-3d', label: 'Ceinture outils', description: 'Ceinture porte-outils 3D.' },
  { id: 'accessory-pouch-3d', label: 'Poche chantier', description: 'Poche technique 3D.' },
] as const

export { outfitPresets }
