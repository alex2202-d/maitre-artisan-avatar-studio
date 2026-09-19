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
  id: 'avatar-workwear-v2',
  label: 'Avatar chantier — V2',
  shortLabel: 'Personnage',
  category: 'Personnage complet',
  description: 'Personnage 3D final texturé PBR et riggé, généré depuis la direction artistique validée.',
  modelUrl: '/assets/avatar/v2/base/avatar_workwear_v2_rigged.glb',
  previewUrl: '/assets/avatar/v2/previews/avatar_workwear_v2.png',
  icon: '●',
  kind: 'character',
}

export const outfit01Assets: ProductionAsset[] = [
  {
    id: 'headwear-hardhat-v2',
    label: 'Casque chantier jaune',
    shortLabel: 'Casque',
    category: 'Couvre-chef',
    description: 'Casque de chantier jaune V2, généré comme module 3D séparé.',
    modelUrl: '/assets/avatar/v2/outfit01/headwear_hardhat_v2.glb',
    previewUrl: '/assets/avatar/v2/previews/headwear_hardhat_v2.png',
    icon: '⌒',
    kind: 'piece',
  },
  {
    id: 'top-workwear-v2',
    label: 'Haut chantier marine',
    shortLabel: 'Haut',
    category: 'Haut',
    description: 'Haut de travail marine avec capuche, plastron, bretelles et accents orange.',
    modelUrl: '/assets/avatar/v2/outfit01/top_workwear_v2.glb',
    previewUrl: '/assets/avatar/v2/previews/top_workwear_v2.png',
    icon: '▣',
    kind: 'piece',
  },
  {
    id: 'bottom-workshort-v2',
    label: 'Short de travail marine',
    shortLabel: 'Bas',
    category: 'Bas',
    description: 'Short de travail marine V2 avec poches, revers et accents orange.',
    modelUrl: '/assets/avatar/v2/outfit01/bottom_workshort_v2.glb',
    previewUrl: '/assets/avatar/v2/previews/bottom_workshort_v2.png',
    icon: '▥',
    kind: 'piece',
  },
  {
    id: 'gloves-work-v2',
    label: 'Gants chantier jaunes',
    shortLabel: 'Gants',
    category: 'Accessoire',
    description: 'Paire de gants de chantier jaunes V2, module 3D séparé.',
    modelUrl: '/assets/avatar/v2/outfit01/gloves_work_v2.glb',
    previewUrl: '/assets/avatar/v2/previews/gloves_work_v2.png',
    icon: '✦',
    kind: 'piece',
  },
  {
    id: 'shoes-work-boots-v2',
    label: 'Chaussures de sécurité',
    shortLabel: 'Chaussures',
    category: 'Chaussures',
    description: 'Paire de boots de chantier brunes V2 avec lacets orange et semelle sombre.',
    modelUrl: '/assets/avatar/v2/outfit01/shoes_work_boots_v2.glb',
    previewUrl: '/assets/avatar/v2/previews/shoes_work_boots_v2.png',
    icon: '◒',
    kind: 'piece',
  },
]

export const productionAssets = [productionCharacter, ...outfit01Assets]

export const outfit01 = {
  id: 'outfit-workwear-v2',
  label: 'Tenue chantier V2',
  status: 'production',
  characterModelUrl: productionCharacter.modelUrl,
  pieces: outfit01Assets.map((asset) => asset.id),
}
