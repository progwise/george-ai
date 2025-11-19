import type { ServiceProviderType } from '@george-ai/ai-service-client'

export interface Library {
  id: string
  name: string
  description: string
  usedFor: string
  embeddingModelProvider: ServiceProviderType
  embeddingModelName: string
}
