export type Outcome = 'healthy' | 'disease' | 'inconclusive'
export type AnalysisStatus = 'done' | 'processing' | 'inconclusive'

/** Region of interest in percentages (0-100) relative to the image. */
export interface Region {
  x: number
  y: number
  w: number
  h: number
}

export interface Analysis {
  id: string
  createdAt: string
  cropId: string | null
  cropName: string
  image: string
  outcome: Outcome
  status: AnalysisStatus
  classification: string
  catalogId: string | null
  confidence: number | null
  property?: string
  notes?: string
  regions: Region[]
  source: 'seed' | 'upload'
}

export interface Crop {
  id: string
  name: string
  image: string
  createdAt: string
  property?: string
  area?: string
  notes?: string
}

export interface CatalogEntry {
  id: string
  name: string
  crops: string[]
  agent: string
  image: string
  summary: string
  description: string
  signs: string[]
}

export interface User {
  name: string
  email: string
  property?: string
  propertyArea?: string
  mainCrops?: string
}

export interface AppNotification {
  id: string
  title: string
  description: string
  createdAt: string
  read: boolean
  href?: string
}

export interface Preferences {
  notifyAnalysis: boolean
  notifyAttention: boolean
  notifyTips: boolean
  areaUnit: 'ha' | 'alqueire' | 'm2'
  compactTables: boolean
  shareAnonymous: boolean
}
