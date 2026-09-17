import type {
  FaceExpression,
  HairStyle,
  HeadwearStyle,
  Morphology,
  PantsStyle,
  ShoeStyle,
  TopStyle,
} from './types'

export type CatalogOption<T extends string> = {
  id: T
  label: string
  description?: string
}

export const morphologyOptions: CatalogOption<Morphology>[] = [
  { id: 'slim', label: 'Svelte' },
  { id: 'standard', label: 'Standard' },
  { id: 'sturdy', label: 'Robuste' },
  { id: 'xl', label: 'XL' },
]

export const expressionOptions: CatalogOption<FaceExpression>[] = [
  { id: 'neutral', label: 'Neutre' },
  { id: 'smile', label: 'Souriant' },
  { id: 'surprised', label: 'Surpris' },
  { id: 'focused', label: 'Concentré' },
  { id: 'content', label: 'Content' },
]

export const hairOptions: CatalogOption<HairStyle>[] = [
  { id: 'none', label: 'Rasé' },
  { id: 'short', label: 'Court' },
  { id: 'tuft', label: 'Mèche' },
  { id: 'side', label: 'Côté' },
]

export const topOptions: CatalogOption<TopStyle>[] = [
  { id: 'tee', label: 'T-shirt' },
  { id: 'hoodie', label: 'Sweat' },
  { id: 'work-jacket', label: 'Veste chantier' },
]

export const pantsOptions: CatalogOption<PantsStyle>[] = [
  { id: 'work-pants', label: 'Pantalon travail' },
  { id: 'cargo', label: 'Cargo' },
]

export const shoeOptions: CatalogOption<ShoeStyle>[] = [
  { id: 'safety-boots', label: 'Chaussures sécurité' },
  { id: 'sneakers', label: 'Baskets' },
]

export const headwearOptions: CatalogOption<HeadwearStyle>[] = [
  { id: 'none', label: 'Aucun' },
  { id: 'beanie', label: 'Bonnet' },
  { id: 'hardhat', label: 'Casque chantier' },
]

export const skinPalette = ['#F0D8CC', '#E5B889', '#D39A69', '#A96E49', '#6D4431']
export const garmentPalette = ['#273246', '#334D67', '#425C43', '#8F3E36', '#C56A2D', '#D2A329', '#30343A']
export const headwearPalette = ['#F4B72A', '#D94D3F', '#28364E', '#F1F0E8', '#33363C']
