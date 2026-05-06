export interface FigmaFile {
  name: string
  role: string
  lastModified: string
  thumbnailUrl: string
  version: string
}

export interface FigmaNode {
  id: string
  name: string
  type: string
  children?: FigmaNode[]
  fills?: any[]
  strokes?: any[]
  effects?: any[]
  absoluteBoundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface FigmaComponent {
  key: string
  name: string
  description: string
  componentSetId?: string
  documentationLinks: any[]
}

export interface GeneratedComponent {
  name: string
  code: string
  type: 'component' | 'page'
  dependencies: string[]
}