export type VectorMap = Record<string, number[]>

export interface CommonPayload {
  [key: string]: string | number | boolean | null
  workspaceId: string
  libraryId: string
  fileId: string
  shardIndex: number | null
  chunkIndex: number
  text: string
  status: 'pending' | 'completed'
}

export interface VectorPoint {
  id: string | number
  vectors?: VectorMap // Optional to support your "metadata-first" flow
  payload: CommonPayload
}

// Type-safe filter keys based on your payload
export interface FilterCriteria {
  must?: Array<{ key: keyof CommonPayload; match: { value: string | number | boolean } }>
  must_not?: Array<{ key: keyof CommonPayload; match: { value: string | number | boolean } }>
}

export type VectorModelsConfig = Record<string, { size: number; distance: 'Cosine' | 'Euclid' | 'Dot' | 'Manhattan' }>

export interface CollectionConfig {
  vectorModels: VectorModelsConfig
}

export interface VectorStore {
  ensure(name: string, config: CollectionConfig): Promise<void>

  upsert(collection: string, points: VectorPoint[]): Promise<void>

  search(
    collection: string,
    options: {
      vectorName: string
      vector: number[]
      filter?: FilterCriteria
      limit?: number
    },
  ): Promise<VectorPoint[]>

  delete(collection: string, ids: (string | number)[]): Promise<void>
}
