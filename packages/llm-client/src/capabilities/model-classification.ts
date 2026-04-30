export interface ModelClassification {
  isEmbeddingModel: boolean
  isChatModel: boolean
  isVisionModel: boolean
  confidence: 'high' | 'medium' | 'low'
}
