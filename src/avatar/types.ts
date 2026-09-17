export type TopStyle = 'tee' | 'hoodie' | 'work-jacket'

export type AvatarConfig = {
  body: 'body-01'
  head: 'head-01'
  skinColor: string
  hairColor: string
  topStyle: TopStyle
  topColor: string
  pantsColor: string
  shoeColor: string
  beanie: boolean
  beanieColor: string
}

export const defaultAvatarConfig: AvatarConfig = {
  body: 'body-01',
  head: 'head-01',
  skinColor: '#D7A06F',
  hairColor: '#2B2118',
  topStyle: 'work-jacket',
  topColor: '#B83A3A',
  pantsColor: '#2D343C',
  shoeColor: '#15181C',
  beanie: true,
  beanieColor: '#B83A3A',
}
