import a0 from './atlas/chunk-00'
import a1 from './atlas/chunk-01'
import a2 from './atlas/chunk-02'
import a3 from './atlas/chunk-03'
import a4 from './atlas/chunk-04'
import a5 from './atlas/chunk-05'
import a6 from './atlas/chunk-06'
import a7 from './atlas/chunk-07'
import a8 from './atlas/chunk-08'
import a9 from './atlas/chunk-09'
import a10 from './atlas/chunk-10'
import a11 from './atlas/chunk-11'
import a12 from './atlas/chunk-12'
import b0 from './base/chunk-00'
import b1 from './base/chunk-01'
import b2 from './base/chunk-02'
import b3 from './base/chunk-03'
import b4 from './base/chunk-04'
import b5 from './base/chunk-05'

export const PREMIUM_ATLAS_SIZE = { width: 1280, height: 1333 } as const

export const PREMIUM_ATLAS_URI = 'data:image/webp;base64,' + a0 + a1 + a2 + a3 + a4 + a5 + a6 + a7 + a8 + a9 + a10 + a11 + a12
export const PREMIUM_BASE_URI = 'data:image/webp;base64,' + b0 + b1 + b2 + b3 + b4 + b5

export type PremiumSpriteKey =
  | 'faces_1' | 'faces_2' | 'faces_3' | 'faces_4' | 'faces_5'
  | 'hair_1' | 'hair_2' | 'hair_3' | 'hair_4' | 'hair_5'
  | 'headwear_1' | 'headwear_2' | 'headwear_3' | 'headwear_4' | 'headwear_5'
  | 'tops_1' | 'tops_2' | 'tops_3' | 'tops_4' | 'tops_5'
  | 'bottoms_1' | 'bottoms_2' | 'bottoms_3' | 'bottoms_4' | 'bottoms_5'
  | 'gloves_1' | 'gloves_2' | 'gloves_3' | 'gloves_4'
  | 'shoes_1' | 'shoes_2' | 'shoes_3' | 'shoes_4' | 'shoes_5'
  | 'accessories_1' | 'accessories_2' | 'accessories_3' | 'accessories_4' | 'accessories_5'
  | 'presets_1' | 'presets_2' | 'presets_3' | 'presets_4' | 'presets_5'

export type SpriteRect = { x: number; y: number; w: number; h: number }

export const PREMIUM_SPRITES: Record<PremiumSpriteKey, SpriteRect> = {
  faces_1:{x:403,y:3,w:125,h:116}, faces_2:{x:531,y:3,w:125,h:115}, faces_3:{x:659,y:3,w:125,h:114}, faces_4:{x:787,y:3,w:125,h:115}, faces_5:{x:915,y:3,w:125,h:116},
  hair_1:{x:1043,y:3,w:130,h:87}, hair_2:{x:3,y:541,w:130,h:93}, hair_3:{x:136,y:541,w:130,h:109}, hair_4:{x:269,y:541,w:130,h:99}, hair_5:{x:402,y:541,w:111,h:110},
  headwear_1:{x:516,y:541,w:130,h:91}, headwear_2:{x:649,y:541,w:130,h:91}, headwear_3:{x:782,y:541,w:130,h:91}, headwear_4:{x:915,y:541,w:130,h:90}, headwear_5:{x:1048,y:541,w:130,h:93},
  tops_1:{x:3,y:654,w:135,h:125}, tops_2:{x:141,y:654,w:145,h:114}, tops_3:{x:289,y:654,w:121,h:125}, tops_4:{x:413,y:654,w:145,h:119}, tops_5:{x:561,y:654,w:145,h:124},
  bottoms_1:{x:709,y:654,w:125,h:180}, bottoms_2:{x:837,y:654,w:125,h:177}, bottoms_3:{x:965,y:654,w:125,h:179}, bottoms_4:{x:1093,y:654,w:125,h:177}, bottoms_5:{x:3,y:837,w:125,h:180},
  gloves_1:{x:131,y:837,w:120,h:88}, gloves_2:{x:254,y:837,w:120,h:88}, gloves_3:{x:377,y:837,w:117,h:90}, gloves_4:{x:497,y:837,w:120,h:88},
  shoes_1:{x:620,y:837,w:116,h:90}, shoes_2:{x:739,y:837,w:113,h:90}, shoes_3:{x:855,y:837,w:116,h:90}, shoes_4:{x:974,y:837,w:112,h:90}, shoes_5:{x:1089,y:837,w:125,h:85},
  accessories_1:{x:3,y:1020,w:130,h:108}, accessories_2:{x:136,y:1020,w:69,h:145}, accessories_3:{x:208,y:1020,w:59,h:145}, accessories_4:{x:270,y:1020,w:89,h:145}, accessories_5:{x:362,y:1020,w:110,h:145},
  presets_1:{x:475,y:1020,w:135,h:310}, presets_2:{x:613,y:1020,w:138,h:310}, presets_3:{x:754,y:1020,w:137,h:310}, presets_4:{x:894,y:1020,w:140,h:310}, presets_5:{x:1037,y:1020,w:131,h:310},
}
