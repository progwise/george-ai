import { QdrantClient } from '@qdrant/js-client-rest'

import { CollectionConfig, CommonPayload, FilterCriteria, VectorPoint, VectorStore } from './types'

export class QdrantAdapter implements VectorStore {
  private client: QdrantClient

  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://gai-qdrant:6333',
      apiKey: process.env.QDRANT_API_KEY || undefined,
    })
  }

  async ensure(name: string, config: CollectionConfig) {
    const { exists } = await this.client.collectionExists(name)
    if (exists) return

    await this.client.createCollection(name, {
      vectors: config.vectorModels,
    })
  }

  async upsert(collection: string, points: VectorPoint[]) {
    await this.client.upsert(collection, {
      wait: true,
      points: points.map((p) => ({
        id: p.id,
        vector: p.vectors || {},
        payload: p.payload,
      })),
    })
  }

  async search(
    collection: string,
    options: {
      vectorName: string
      vector: number[]
      filter?: FilterCriteria
      limit?: number
    },
  ) {
    const { vectorName, vector, filter, limit } = options
    const results = await this.client.search(collection, {
      vector: { name: vectorName, vector },
      filter: filter as Record<string, unknown>, // Now type-checked against FilterCriteria<P>
      limit,
      with_payload: true,
    })

    return results.map((r) => ({
      id: r.id,
      payload: r.payload as CommonPayload,
    }))
  }

  async delete(collection: string, ids: (string | number)[]) {
    await this.client.delete(collection, {
      points: ids,
      wait: true,
    })
  }
}
