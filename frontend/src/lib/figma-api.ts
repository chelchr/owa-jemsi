import { FigmaFile, FigmaNode, FigmaComponent } from '@/types/figma'

const FIGMA_API_BASE = 'https://api.figma.com/v1'

export class FigmaAPI {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async request(endpoint: string) {
    const response = await fetch(`${FIGMA_API_BASE}${endpoint}`, {
      headers: {
        'X-Figma-Token': this.token,
      },
    })

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getFile(fileKey: string): Promise<any> {
    return this.request(`/files/${fileKey}`)
  }

  async getFileNodes(fileKey: string, nodeIds: string[]): Promise<any> {
    const ids = nodeIds.join(',')
    return this.request(`/files/${fileKey}/nodes?ids=${ids}`)
  }

  async getFileComponents(fileKey: string): Promise<{ meta: { components: FigmaComponent[] } }> {
    return this.request(`/files/${fileKey}/components`)
  }

  async getImage(fileKey: string, nodeIds: string[], format: 'png' | 'svg' = 'png'): Promise<any> {
    const ids = nodeIds.join(',')
    return this.request(`/images/${fileKey}?ids=${ids}&format=${format}`)
  }
}