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
    /text-embedding-3/, // OpenAI text-embedding-3-small/large
    /text-embedding-ada/, // OpenAI text-embedding-ada-002
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
    /^gpt-5/, // OpenAI GPT-5 series (gpt-5, gpt-5-mini, gpt-5-nano)
    /^gpt-4\.1/, // OpenAI GPT-4.1 series (gpt-4.1, gpt-4.1-mini, gpt-4.1-nano)
    /^gpt-4-turbo/, // OpenAI GPT-4 Turbo
    /^gpt-4/, // OpenAI GPT-4
    /^gpt-3\.5-turbo/, // OpenAI GPT-3.5 Turbo
    /^o3-/, // OpenAI o3 reasoning models
    /^o4-/, // OpenAI o4 reasoning models
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
    /^gpt-4o/, // OpenAI GPT-4o (native multimodal)
    /^gpt-5/, // OpenAI GPT-5 series (multimodal: text, image, audio, video)
    /^gpt-4-turbo/, // OpenAI GPT-4 Turbo (vision support)
    /^o3-/, // OpenAI o3 reasoning models (vision support)
    /^o4-/, // OpenAI o4 reasoning models (vision support)
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

export const getCapabilitiesForModel = (modelName: string): string[] => {
  const classification = classifyModel(modelName)
  const capabilities: string[] = []

  if (classification.isChatModel) {
    capabilities.push('chat')
  }
  if (classification.isEmbeddingModel) {
    capabilities.push('embedding')
  }
  if (classification.isVisionModel) {
    capabilities.push('vision')
    capabilities.push('ocr')
  }

  return capabilities
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
