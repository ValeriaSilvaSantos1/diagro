const BASE = 'https://images.unsplash.com/'

/** Builds a sized Unsplash CDN URL for a photo id. */
export function img(id: string, w = 1200, h?: number) {
  return `${BASE}${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=80`
}

export const PHOTOS = {
  // Leaves with visible spots / lesions
  heroLeaf: 'photo-1769613637793-1d497f0fedf0',
  spotsMacro: 'photo-1696786146420-ecc370b1d794',
  spotsBacklit: 'photo-1789045954269-146ce76840ed',
  spotsBrown: 'photo-1692481060581-98c224124f12',
  spotsYellow: 'photo-1692481061201-5767c19396af',
  spotsLong: 'photo-1649088311431-9ffe92a4d4a4',
  leafEdge: 'photo-1620055494738-248ba57ed714',
  discolored: 'photo-1769613638176-9867759e8b19',
  mosaic: 'photo-1585396352317-a625bee2dac0',
  holes: 'photo-1713226216920-fd559475a701',
  blurryLeaf: 'photo-1651494085290-5f00e856c470',
  // Healthy leaves
  healthyA: 'photo-1547936785-c57315d64694',
  healthyB: 'photo-1544038232-d9f8f06921d3',
  healthyC: 'photo-1542991214-df0aa5950676',
  healthyD: 'photo-1579451872261-2e2d4527c2e3',
  // People & fields
  farmer: 'photo-1741874299706-2b8e16839aaa',
  farmerKneel: 'photo-1626906722163-bd4c03cb3b9b',
  phoneField: 'photo-1586819158505-d7f6227d19d4',
  aerialRows: 'photo-1760125597705-36c84a990a79',
  rowsPortrait: 'photo-1780167603597-b012ff3af861',
  greenFarm: 'photo-1545292470-391a7b77b8a2',
  // Crops
  tomato: 'photo-1596199050105-6d5d32222916',
  corn: 'photo-1551810080-3eb3be72d3f4',
  soy: 'photo-1655929299728-93ee15ed7967',
  bean: 'photo-1639947219179-bb0357b8856a',
  coffee: 'photo-1562702076-c719c8796b8d',
} as const

export type PhotoKey = keyof typeof PHOTOS

export const photo = (key: PhotoKey, w = 1200, h?: number) => img(PHOTOS[key], w, h)
