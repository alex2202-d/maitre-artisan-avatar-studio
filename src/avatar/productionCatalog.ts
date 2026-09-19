export type ProductionAsset = {
  id: string
  label: string
  shortLabel: string
  category: string
  description: string
  modelUrl: string
  previewUrl: string
  icon: string
  kind: 'character' | 'piece'
}

export const productionCharacter: ProductionAsset = {
  id: 'avatar-workwear-v1',
  label: 'Avatar chantier — Tenue 01',
  shortLabel: 'Personnage',
  category: 'Personnage complet',
  description: 'Personnage 3D complet, texturé et riggé avec la première tenue chantier.',
  modelUrl: '/assets/avatar/v1/base/avatar_workwear_rigged.glb',
  previewUrl: '/assets/avatar/v1/previews/avatar_workwear.png',
  icon: '●',
  kind: 'character',
}

export const outfit01Assets: ProductionAsset[] = [
  {
    id: 'headwear-hardhat-01',
    label: 'Casque chantier jaune',
    shortLabel: 'Casque',
    category: 'Couvre-chef',
    description: 'Casque de chantier jaune, module 3D séparé.',
    modelUrl: '/assets/avatar/v1/outfit01/headwear_hardhat_01.glb',
    previewUrl: '/assets/avatar/v1/previews/headwear_hardhat_01.png',
    icon: '⌒',
    kind: 'piece',
  },
  {
    id: 'top-work-hoodie-overall-01',
    label: 'Haut chantier marine',
    shortLabel: 'Haut',
    category: 'Haut',
    description: 'Sweat de travail marine avec plastron, bretelles et accents orange.',
    modelUrl: '/assets/avatar/v1/outfit01/top_work_hoodie_overall_01.glb',
    previewUrl: '/assets/avatar/v1/previews/top_work_hoodie_overall_01.png',
    icon: '▣',
    kind: 'piece',
  },
  {
    id: 'bottom-work-shorts-01',
    label: 'Short de travail marine',
    shortLabel: 'Bas',
    category: 'Bas',
    description: 'Short de travail marine avec poches et accents orange.',
    modelUrl: '/assets/avatar/v1/outfit01/bottom_work_shorts_01.glb',
    previewUrl: '/assets/avatar/v1/previews/bottom_work_shorts_01.png',
    icon: '▥',
    kind: 'piece',
  },
  {
    id: 'gloves-work-01',
    label: 'Gants chantier jaunes',
    shortLabel: 'Gants',
    category: 'Accessoire',
    description: 'Paire de gants de chantier jaunes, module 3D séparé.',
    modelUrl: '/assets/avatar/v1/outfit01/gloves_work_01.glb',
    previewUrl: '/assets/avatar/v1/previews/gloves_work_01.png',
    icon: '✦',
    kind: 'piece',
  },
  {
    id: 'shoes-work-boots-01',
    label: 'Chaussures de sécurité',
    shortLabel: 'Chaussures',
    category: 'Chaussures',
    description: 'Paire de boots de chantier brunes à semelle sombre.',
    modelUrl: '/assets/avatar/v1/outfit01/shoes_work_boots_01.glb',
    previewUrl: '/assets/avatar/v1/previews/shoes_work_boots_01.png',
    icon: '◒',
    kind: 'piece',
  },
]

export const productionAssets = [productionCharacter, ...outfit01Assets]

export const outfit01 = {
  id: 'outfit-workwear-01',
  label: 'Tenue chantier 01',
  status: 'production',
  characterModelUrl: productionCharacter.modelUrl,
  pieces: outfit01Assets.map((asset) => asset.id),
}
