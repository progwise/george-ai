export interface ModelClassification {
  isEmbeddingModel: boolean
  isChatModel: boolean
  confidence: 'high' | 'medium' | 'low'
}

/**
 * Classifies Ollama models based on their names to determine their primary purpose
 */
export const classifyModel = (modelName: string): ModelClassification => {
  const name = modelName.toLowerCase()
  
  // High confidence embedding model patterns
  const strongEmbeddingPatterns = [
    /^nomic-embed/,      // Nomic embedding models
    /^mxbai-embed/,      // MixedBread AI embedding models
    /^bge-/,             // BGE series embedding models
    /^e5-/,              // E5 series embedding models
    /text-embedding/,    // OpenAI-style naming
    /^all-minilm/,       // All-MiniLM embedding models
  ]
  
  // Medium confidence embedding model patterns
  const mediumEmbeddingPatterns = [
    /embed/,             // Contains "embed"
    /embedding/,         // Contains "embedding"
    /sentence/,          // Sentence transformers (can be dual-purpose)
    /paraphrase/,        // Paraphrase models
  ]
  
  // High confidence chat model patterns
  const strongChatPatterns = [
    /^llama/,            // Llama models
    /^mistral/,          // Mistral models
    /^codellama/,        // Code Llama models
    /^qwen/,             // Qwen models
    /^gemma/,            // Gemma models
    /^dolphin/,          // Dolphin models
    /^vicuna/,           // Vicuna models
    /^alpaca/,           // Alpaca models
    /^chat/,             // Models with "chat" prefix
    /^gpt/,              // GPT-style models
    /instruct/,          // Instruction-tuned models
  ]
  
  // Medium confidence chat model patterns
  const mediumChatPatterns = [
    /^phi/,              // Phi models (can be dual-purpose)
    /^tinyllama/,        // TinyLlama models
    /^neural/,           // Neural models
  ]
  
  // Check for strong embedding indicators
  if (strongEmbeddingPatterns.some(pattern => pattern.test(name))) {
    return {
      isEmbeddingModel: true,
      isChatModel: false,
      confidence: 'high'
    }
  }
  
  // Check for strong chat indicators
  if (strongChatPatterns.some(pattern => pattern.test(name))) {
    return {
      isEmbeddingModel: false,
      isChatModel: true,
      confidence: 'high'
    }
  }
  
  // Check for medium embedding indicators
  if (mediumEmbeddingPatterns.some(pattern => pattern.test(name))) {
    return {
      isEmbeddingModel: true,
      isChatModel: false,
      confidence: 'medium'
    }
  }
  
  // Check for medium chat indicators
  if (mediumChatPatterns.some(pattern => pattern.test(name))) {
    return {
      isEmbeddingModel: false,
      isChatModel: true,
      confidence: 'medium'
    }
  }
  
  // Default: assume chat model with low confidence
  return {
    isEmbeddingModel: false,
    isChatModel: true,
    confidence: 'low'
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