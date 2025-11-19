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
    /^embeddinggemma/, // Gemma embedding models
    /^snowflake-arctic-embed/, // Snowflake Arctic embedding models
    /^qwen.*embedding/, // Qwen embedding models (qwen3-embedding)
    /^granite-embedding/, // Granite embedding models
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
    /^mixtral/, // Mixtral MoE models (mixtral-8x7b, mixtral-8x22b)
    /^codellama/, // Code Llama models
    /^qwen/, // Qwen models
    /^gemma/, // Gemma models
    /^deepseek/, // DeepSeek models (deepseek-r1, deepseek-v3.1)
    /^granite/, // Granite models (granite3.1, granite3.2, granite4)
    /^glm/, // GLM models (glm-4-9b-chat)
    /^falcon/, // Falcon models (falcon-2-11b)
    /^yi/, // Yi models (yi-1.5-34b-chat)
    /^jamba/, // Jamba hybrid Mamba/Transformer models (jamba-1.5-mini, jamba-1.5-large)
    /^nemotron/, // NVIDIA Nemotron models (nemotron-4-340b-instruct)
    /^dolphin/, // Dolphin models
    /^vicuna/, // Vicuna models
    /^alpaca/, // Alpaca models
    /^chat/, // Models with "chat" prefix
    /^gpt-5\.1/, // OpenAI GPT-5.1 (Latest: best for coding/agentic tasks)
    /^gpt-5/, // OpenAI GPT-5 series (gpt-5, gpt-5-mini, gpt-5-nano, gpt-5-pro)
    /^gpt-4\.1/, // OpenAI GPT-4.1 series (gpt-4.1, gpt-4.1-mini, gpt-4.1-nano)
    /^gpt-4-turbo/, // OpenAI GPT-4 Turbo (Nov 2023: 128K context)
    /^gpt-4o/, // OpenAI GPT-4o (Jul 2024: gpt-4o, gpt-4o-mini - multimodal)
    /^gpt-4/, // OpenAI GPT-4 base (no vision in base gpt-4)
    /^gpt-3\.5-turbo/, // OpenAI GPT-3.5 Turbo (replaced by gpt-4o-mini)
    /^o1-preview$/, // OpenAI o1-preview (Sep 2024: text-only, no vision)
    /^o1-mini$/, // OpenAI o1-mini (Sep 2024: text-only, no vision)
    /^o[134]($|-|:)/, // OpenAI reasoning models (o1, o3, o4 and variants)
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
    /^qwen.*vl/, // Qwen-VL vision models (qwen2.5vl, qwen3-vl, etc.)
    /^qwen.*omni/, // Qwen-Omni multimodal models (qwen3-omni-30b with text+image+audio+video)
    /^gemma3/, // Gemma3 vision models (gemma3:270m, gemma3:1b, gemma3:4b, gemma3:12b, gemma3:27b)
    /^llama3\.2.*vision/, // Llama 3.2 vision models (llama3.2-vision-11b, llama3.2-vision-90b)
    /^llama4.*vision/, // Llama 4 vision models (NOT Scout which is text-only)
    /^llava/, // LLaVA vision models
    /^minicpm-v/, // MiniCPM-V vision models
    /^internvl/, // InternVL vision models
    /^cogvlm/, // CogVLM vision models
    /^pixtral/, // Pixtral vision models (pixtral-12b - Mistral VLM)
    /^mistral-small/, // Mistral Small vision models (mistral-small3.1, mistral-small3.2)
    /^granite.*vision/, // Granite vision models (granite3.2-vision)
    /^moondream/, // Moondream vision models
    /^deepseek.*janus/, // DeepSeek Janus-Pro (unified vision understanding + generation)
    /janus-pro/, // DeepSeek Janus-Pro-7B (vision+gen)
    /^yi.*vl/, // Yi-VL vision models (yi-vl-34b)
    /^glm.*v[-\d]/, // GLM vision models (glm-4.1v-9b-thinking, glm-4v-9b)
    /^falcon.*vlm/, // Falcon VLM models (falcon-2-11b-vlm)
    /^phi-4-multimodal/, // Phi-4-multimodal (vision+audio)
    /^gpt-4o/, // OpenAI GPT-4o (Jul 2024: native multimodal - text, vision)
    /^gpt-5\.1/, // OpenAI GPT-5.1 (Latest: multimodal with configurable reasoning)
    /^gpt-5/, // OpenAI GPT-5 series (multimodal - text, image, audio, video)
    /^gpt-4\.1/, // OpenAI GPT-4.1 series (smartest non-reasoning model with vision)
    /^gpt-4-turbo/, // OpenAI GPT-4 Turbo (Nov 2023: vision + 128K context)
    /^o1(?!-preview|-mini)($|:|-)/, // OpenAI o1 full model (Dec 2024: vision) - excludes o1-preview/o1-mini
    /^o3/, // OpenAI o3 reasoning models (Apr 2025: vision + reasoning)
    /^o4/, // OpenAI o4 reasoning models (Apr 2025: vision + reasoning)
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
