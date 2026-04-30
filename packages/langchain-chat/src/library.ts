import { InferenceDriver } from '@george-ai/app-schema'

export interface Library {
  id: string
  name: string
  description: string
  usedFor: string
  embeddingModelProvider: InferenceDriver
  embeddingModelName: string
}
