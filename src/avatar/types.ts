export type Morphology = 'slim' | 'standard' | 'sturdy' | 'xl'
export type FaceExpression = 'neutral' | 'smile' | 'surprised' | 'focused' | 'content'
export type HairStyle = 'none' | 'short' | 'tuft' | 'side'
export type TopStyle = 'tee' | 'hoodie' | 'work-jacket'
export type PantsStyle = 'work-pants' | 'cargo'
export type ShoeStyle = 'safety-boots' | 'sneakers'
export type HeadwearStyle = 'none' | 'beanie' | 'hardhat'

export type AvatarConfig = {
  version: 1
  morphology: Morphology
  skinColor: string
  expression: FaceExpression
  hairStyle: HairStyle
  hairColor: string
  topStyle: TopStyle
  topColor: string
  pantsStyle: PantsStyle
  pantsColor: string
  shoeStyle: ShoeStyle
  shoeColor: string
  headwear: HeadwearStyle
  headwearColor: string
  gloves: boolean
  gloveColor: string
  toolbelt: boolean
}

export const defaultAvatarConfig: AvatarConfig = {
  version: 1,
  morphology: 'standard',
  skinColor: '#D7A06F',
  expression: 'neutral',
  hairStyle: 'short',
  hairColor: '#2B2118',
  topStyle: 'work-jacket',
  topColor: '#273246',
  pantsStyle: 'work-pants',
  pantsColor: '#26303A',
  shoeStyle: 'safety-boots',
  shoeColor: '#352C29',
  headwear: 'hardhat',
  headwearColor: '#F4B72A',
  gloves: true,
  gloveColor: '#E5A923',
  toolbelt: true,
}
