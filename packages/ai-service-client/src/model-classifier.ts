export interface ModelClassification {
  isEmbeddingModel: boolean
  isChatModel: boolean
  isVisionModel: boolean
  confidence: 'high' | 'medium' | 'low'
}

/**
 * Classifies Ollama models based on their names to determine their primary purpose
 */
export const classifyModel = (modelName: string): ModelClassification => {
  const name = modelName.toLowerCase()

  // High confidence embedding model patterns
  const strongEmbeddingPatterns = [
    /^nomic-embed/, // Nomic embedding models
    /^mxbai-embed/, // MixedBread AI embedding models
    /^bge-/, // BGE series embedding models
    /^e5-/, // E5 series embedding models
    /text-embedding/, // OpenAI-style naming
    /^all-minilm/, // All-MiniLM embedding models
  ]

  // Medium confidence embedding model patterns
  const mediumEmbeddingPatterns = [
    /embed/, // Contains "embed"
    /embedding/, // Contains "embedding"
    /sentence/, // Sentence transformers (can be dual-purpose)
    /paraphrase/, // Paraphrase models
  ]

  // High confidence chat model patterns
  const strongChatPatterns = [
    /^llama/, // Llama models
    /^mistral/, // Mistral models
    /^codellama/, // Code Llama models
    /^qwen/, // Qwen models
    /^gemma/, // Gemma models
    /^dolphin/, // Dolphin models
    /^vicuna/, // Vicuna models
    /^alpaca/, // Alpaca models
    /^chat/, // Models with "chat" prefix
    /^gpt/, // GPT-style models
    /instruct/, // Instruction-tuned models
  ]

  // Medium confidence chat model patterns
  const mediumChatPatterns = [
    /^phi/, // Phi models (can be dual-purpose)
    /^tinyllama/, // TinyLlama models
    /^neural/, // Neural models
  ]

  // High confidence vision/OCR model patterns
  const strongVisionPatterns = [
    /^qwen.*vl/, // Qwen-VL vision models (qwen2.5vl, qwen-vl, etc.)
    /^llava/, // LLaVA vision models
    /^minicpm-v/, // MiniCPM-V vision models
    /^internvl/, // InternVL vision models
    /^cogvlm/, // CogVLM vision models
    /vision/, // Models with "vision" in name
  ]

  // Medium confidence vision model patterns
  const mediumVisionPatterns = [
    /^phi.*vision/, // Phi vision models
    /vl$/, // Models ending with "vl" (vision-language)
    /-v\d/, // Models with version pattern like -v1, -v2
    /multimodal/, // Multimodal models
  ]

  // Check for strong vision indicators (highest priority as they're most specific)
  if (strongVisionPatterns.some((pattern) => pattern.test(name))) {
    return {
      isEmbeddingModel: false,
      isChatModel: true, // Vision models are also chat models
      isVisionModel: true,
      confidence: 'high',
    }
  }

  // Check for strong embedding indicators
  if (strongEmbeddingPatterns.some((pattern) => pattern.test(name))) {
    return {
      isEmbeddingModel: true,
      isChatModel: false,
      isVisionModel: false,
      confidence: 'high',
    }
  }

  // Check for strong chat indicators
  if (strongChatPatterns.some((pattern) => pattern.test(name))) {
    return {
      isEmbeddingModel: false,
      isChatModel: true,
      isVisionModel: false,
      confidence: 'high',
    }
  }

  // Check for medium vision indicators
  if (mediumVisionPatterns.some((pattern) => pattern.test(name))) {
    return {
      isEmbeddingModel: false,
      isChatModel: true, // Vision models are also chat models
      isVisionModel: true,
      confidence: 'medium',
    }
  }

  // Check for medium embedding indicators
  if (mediumEmbeddingPatterns.some((pattern) => pattern.test(name))) {
    return {
      isEmbeddingModel: true,
      isChatModel: false,
      isVisionModel: false,
      confidence: 'medium',
    }
  }

  // Check for medium chat indicators
  if (mediumChatPatterns.some((pattern) => pattern.test(name))) {
    return {
      isEmbeddingModel: false,
      isChatModel: true,
      isVisionModel: false,
      confidence: 'medium',
    }
  }

  // Default: assume chat model with low confidence
  return {
    isEmbeddingModel: false,
    isChatModel: true,
    isVisionModel: false,
    confidence: 'low',
  }
}

/**
 * Filters models for embedding use
 */
export const isEmbeddingModel = (modelName: string): boolean => {
  const classification = classifyModel(modelName)
  return classification.isEmbeddingModel
}

/**
 * Filters models for chat use
 */
export const isChatModel = (modelName: string): boolean => {
  const classification = classifyModel(modelName)
  return classification.isChatModel
}

/**
 * Filters models for vision/OCR use
 */
export const isVisionModel = (modelName: string): boolean => {
  const classification = classifyModel(modelName)
  return classification.isVisionModel
}
