import { describe, expect, it } from 'vitest'

import {
  classifyModel,
  getCapabilitiesForModel,
  isChatModel,
  isEmbeddingModel,
  isVisionModel,
} from './model-classifier'

describe('Model Classifier - Ollama Models', () => {
  describe('Embedding Models', () => {
    it('should classify nomic-embed-text as embedding model', () => {
      const result = classifyModel('nomic-embed-text')
      expect(result.isEmbeddingModel).toBe(true)
      expect(result.isChatModel).toBe(false)
      expect(result.isVisionModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify mxbai-embed-large as embedding model', () => {
      const result = classifyModel('mxbai-embed-large')
      expect(result.isEmbeddingModel).toBe(true)
      expect(result.isChatModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify bge-m3 as embedding model', () => {
      const result = classifyModel('bge-m3')
      expect(result.isEmbeddingModel).toBe(true)
      expect(result.isChatModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify all-minilm as embedding model', () => {
      const result = classifyModel('all-minilm')
      expect(result.isEmbeddingModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify embeddinggemma as embedding model', () => {
      const result = classifyModel('embeddinggemma')
      expect(result.isEmbeddingModel).toBe(true)
      expect(result.isChatModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify snowflake-arctic-embed as embedding model', () => {
      const result = classifyModel('snowflake-arctic-embed')
      expect(result.isEmbeddingModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify qwen3-embedding as embedding model', () => {
      const result = classifyModel('qwen3-embedding:4b')
      expect(result.isEmbeddingModel).toBe(true)
      expect(result.isChatModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify granite-embedding as embedding model', () => {
      const result = classifyModel('granite-embedding:278m')
      expect(result.isEmbeddingModel).toBe(true)
      expect(result.confidence).toBe('high')
    })
  })

  describe('Vision Models', () => {
    it('should classify qwen3-vl as vision+chat model', () => {
      const result = classifyModel('qwen3-vl:32b')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.isEmbeddingModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify gemma3 as vision+chat model', () => {
      const result = classifyModel('gemma3:4b')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.isEmbeddingModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify llama3.2-vision as vision+chat model', () => {
      const result = classifyModel('llama3.2-vision:11b')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify llama4-vision as vision+chat model', () => {
      const result = classifyModel('llama4-vision:16x17b')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify llava as vision+chat model', () => {
      const result = classifyModel('llava:7b')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify minicpm-v as vision+chat model', () => {
      const result = classifyModel('minicpm-v:8b')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify qwen2.5vl as vision+chat model', () => {
      const result = classifyModel('qwen2.5vl:7b')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify mistral-small as vision+chat model', () => {
      const result = classifyModel('mistral-small3.2:24b')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify granite-vision as vision+chat model', () => {
      const result = classifyModel('granite3.2-vision:2b')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify moondream as vision+chat model', () => {
      const result = classifyModel('moondream')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify qwen3-omni as vision+chat model', () => {
      const result = classifyModel('qwen3-omni-30b')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.isEmbeddingModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify pixtral as vision+chat model', () => {
      const result = classifyModel('pixtral-12b')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify deepseek-janus-pro as vision+chat model', () => {
      const result = classifyModel('deepseek-janus-pro-7b')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify yi-vl as vision+chat model', () => {
      const result = classifyModel('yi-vl-34b')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify glm-4.1v-9b-thinking as vision+chat model', () => {
      const result = classifyModel('glm-4.1v-9b-thinking')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify falcon-2-11b-vlm as vision+chat model', () => {
      const result = classifyModel('falcon-2-11b-vlm')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify phi-4-multimodal as vision+chat model', () => {
      const result = classifyModel('phi-4-multimodal-instruct')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })
  })

  describe('Chat Models', () => {
    it('should classify qwen3 as chat-only model (NOT vision)', () => {
      const result = classifyModel('qwen3:4b')
      expect(result.isChatModel).toBe(true)
      expect(result.isVisionModel).toBe(false)
      expect(result.isEmbeddingModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify qwen2.5 as chat-only model', () => {
      const result = classifyModel('qwen2.5:14b')
      expect(result.isChatModel).toBe(true)
      expect(result.isVisionModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify llama3.3 as chat-only model', () => {
      const result = classifyModel('llama3.3:70b')
      expect(result.isChatModel).toBe(true)
      expect(result.isVisionModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify mistral as chat model', () => {
      const result = classifyModel('mistral:7b')
      expect(result.isChatModel).toBe(true)
      expect(result.isVisionModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify deepseek-r1 as chat model', () => {
      const result = classifyModel('deepseek-r1')
      expect(result.isChatModel).toBe(true)
      expect(result.isVisionModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify deepseek-v3.1 as chat model', () => {
      const result = classifyModel('deepseek-v3.1')
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify granite3.2 as chat model', () => {
      const result = classifyModel('granite3.2')
      expect(result.isChatModel).toBe(true)
      expect(result.isVisionModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify granite4 as chat model', () => {
      const result = classifyModel('granite4')
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify llama4-scout as chat-only model (NOT vision)', () => {
      const result = classifyModel('llama4-scout')
      expect(result.isChatModel).toBe(true)
      expect(result.isVisionModel).toBe(false)
      expect(result.isEmbeddingModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify mixtral-8x7b as chat model', () => {
      const result = classifyModel('mixtral-8x7b-instruct')
      expect(result.isChatModel).toBe(true)
      expect(result.isVisionModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify mixtral-8x22b as chat model', () => {
      const result = classifyModel('mixtral-8x22b-instruct')
      expect(result.isChatModel).toBe(true)
      expect(result.isVisionModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify glm-4-9b-chat as chat model', () => {
      const result = classifyModel('glm-4-9b-chat')
      expect(result.isChatModel).toBe(true)
      expect(result.isVisionModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify falcon-2-11b as chat model', () => {
      const result = classifyModel('falcon-2-11b')
      expect(result.isChatModel).toBe(true)
      expect(result.isVisionModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify yi-1.5-34b-chat as chat model', () => {
      const result = classifyModel('yi-1.5-34b-chat')
      expect(result.isChatModel).toBe(true)
      expect(result.isVisionModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify jamba-1.5-large as chat model', () => {
      const result = classifyModel('jamba-1.5-large')
      expect(result.isChatModel).toBe(true)
      expect(result.isVisionModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify nemotron-4-340b-instruct as chat model', () => {
      const result = classifyModel('nemotron-4-340b-instruct')
      expect(result.isChatModel).toBe(true)
      expect(result.isVisionModel).toBe(false)
      expect(result.confidence).toBe('high')
    })
  })

  describe('Edge Cases - gemma vs gemma3', () => {
    it('should classify gemma3 as vision model', () => {
      const result = classifyModel('gemma3:1b')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
    })

    it('should classify gemma2 as chat-only (NOT vision)', () => {
      const result = classifyModel('gemma2:9b')
      expect(result.isVisionModel).toBe(false)
      expect(result.isChatModel).toBe(true)
    })

    it('should classify gemma (legacy) as chat-only', () => {
      const result = classifyModel('gemma:2b')
      expect(result.isVisionModel).toBe(false)
      expect(result.isChatModel).toBe(true)
    })
  })
})

describe('Model Classifier - OpenAI Models', () => {
  describe('Embedding Models', () => {
    it('should classify text-embedding-3-small as embedding model', () => {
      const result = classifyModel('text-embedding-3-small')
      expect(result.isEmbeddingModel).toBe(true)
      expect(result.isChatModel).toBe(false)
      expect(result.isVisionModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify text-embedding-3-large as embedding model', () => {
      const result = classifyModel('text-embedding-3-large')
      expect(result.isEmbeddingModel).toBe(true)
      expect(result.isChatModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify text-embedding-ada-002 as embedding model', () => {
      const result = classifyModel('text-embedding-ada-002')
      expect(result.isEmbeddingModel).toBe(true)
      expect(result.isChatModel).toBe(false)
      expect(result.confidence).toBe('high')
    })
  })

  describe('Chat Models with Vision', () => {
    it('should classify gpt-4o as vision+chat model', () => {
      const result = classifyModel('gpt-4o')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.isEmbeddingModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify gpt-4o-mini as vision+chat model', () => {
      const result = classifyModel('gpt-4o-mini')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify gpt-4-turbo as vision+chat model', () => {
      const result = classifyModel('gpt-4-turbo')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify gpt-5 as vision+chat model', () => {
      const result = classifyModel('gpt-5')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify o3-preview as vision+chat model', () => {
      const result = classifyModel('o3-preview')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify o3-mini as vision+chat model', () => {
      const result = classifyModel('o3-mini')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify o4-mini as vision+chat model', () => {
      const result = classifyModel('o4-mini')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })
  })

  describe('Chat Models without Vision', () => {
    it('should classify gpt-4 as chat-only model (no vision)', () => {
      const result = classifyModel('gpt-4')
      expect(result.isChatModel).toBe(true)
      expect(result.isVisionModel).toBe(false)
      expect(result.isEmbeddingModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify gpt-3.5-turbo as chat-only model', () => {
      const result = classifyModel('gpt-3.5-turbo')
      expect(result.isChatModel).toBe(true)
      expect(result.isVisionModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify gpt-3.5-turbo-16k as chat-only model', () => {
      const result = classifyModel('gpt-3.5-turbo-16k')
      expect(result.isChatModel).toBe(true)
      expect(result.isVisionModel).toBe(false)
      expect(result.confidence).toBe('high')
    })
  })

  describe('Edge Cases - GPT-4 variants', () => {
    it('should classify gpt-4-turbo as vision model', () => {
      const result = classifyModel('gpt-4-turbo-2024-04-09')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
    })

    it('should classify gpt-4-0613 as chat-only (no vision)', () => {
      const result = classifyModel('gpt-4-0613')
      expect(result.isVisionModel).toBe(false)
      expect(result.isChatModel).toBe(true)
    })

    it('should classify gpt-4-32k as chat-only', () => {
      const result = classifyModel('gpt-4-32k')
      expect(result.isVisionModel).toBe(false)
      expect(result.isChatModel).toBe(true)
    })
  })

  describe('Edge Cases - o1 series variants', () => {
    it('should classify o1 (full model) as vision+chat model', () => {
      const result = classifyModel('o1')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.isEmbeddingModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify o1-preview as chat-only (NO vision)', () => {
      const result = classifyModel('o1-preview')
      expect(result.isVisionModel).toBe(false)
      expect(result.isChatModel).toBe(true)
      expect(result.isEmbeddingModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify o1-mini as chat-only (NO vision)', () => {
      const result = classifyModel('o1-mini')
      expect(result.isVisionModel).toBe(false)
      expect(result.isChatModel).toBe(true)
      expect(result.isEmbeddingModel).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should classify o3 standalone as vision+chat model', () => {
      const result = classifyModel('o3')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify o4 standalone as vision+chat model', () => {
      const result = classifyModel('o4')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })
  })

  describe('2025 OpenAI Models - GPT-4.1 and GPT-5', () => {
    it('should classify gpt-4.1 as vision+chat model', () => {
      const result = classifyModel('gpt-4.1')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify gpt-4.1-mini as vision+chat model', () => {
      const result = classifyModel('gpt-4.1-mini')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify gpt-4.1-nano as vision+chat model', () => {
      const result = classifyModel('gpt-4.1-nano')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify gpt-5.1 as vision+chat model', () => {
      const result = classifyModel('gpt-5.1')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify gpt-5 as vision+chat model', () => {
      const result = classifyModel('gpt-5')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify gpt-5-mini as vision+chat model', () => {
      const result = classifyModel('gpt-5-mini')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify gpt-5-nano as vision+chat model', () => {
      const result = classifyModel('gpt-5-nano')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should classify gpt-5-pro as vision+chat model', () => {
      const result = classifyModel('gpt-5-pro')
      expect(result.isVisionModel).toBe(true)
      expect(result.isChatModel).toBe(true)
      expect(result.confidence).toBe('high')
    })
  })
})

describe('Model Classifier - Utility Functions', () => {
  describe('getCapabilitiesForModel', () => {
    it('should return chat and embedding for embedding models', () => {
      const capabilities = getCapabilitiesForModel('nomic-embed-text')
      expect(capabilities).toContain('embedding')
      expect(capabilities).not.toContain('chat')
      expect(capabilities).not.toContain('vision')
    })

    it('should return chat, vision, and ocr for vision models', () => {
      const capabilities = getCapabilitiesForModel('llava:7b')
      expect(capabilities).toContain('chat')
      expect(capabilities).toContain('vision')
      expect(capabilities).toContain('ocr')
      expect(capabilities).not.toContain('embedding')
    })

    it('should return only chat for chat-only models', () => {
      const capabilities = getCapabilitiesForModel('llama3.3:70b')
      expect(capabilities).toContain('chat')
      expect(capabilities).not.toContain('vision')
      expect(capabilities).not.toContain('embedding')
    })
  })

  describe('isEmbeddingModel', () => {
    it('should return true for embedding models', () => {
      expect(isEmbeddingModel('text-embedding-3-small')).toBe(true)
      expect(isEmbeddingModel('nomic-embed-text')).toBe(true)
      expect(isEmbeddingModel('bge-m3')).toBe(true)
    })

    it('should return false for non-embedding models', () => {
      expect(isEmbeddingModel('gpt-4o')).toBe(false)
      expect(isEmbeddingModel('llama3.3')).toBe(false)
      expect(isEmbeddingModel('gemma3:4b')).toBe(false)
    })
  })

  describe('isChatModel', () => {
    it('should return true for chat models', () => {
      expect(isChatModel('gpt-4o')).toBe(true)
      expect(isChatModel('llama3.3')).toBe(true)
      expect(isChatModel('qwen3:4b')).toBe(true)
    })

    it('should return false for embedding-only models', () => {
      expect(isChatModel('text-embedding-3-small')).toBe(false)
      expect(isChatModel('nomic-embed-text')).toBe(false)
      expect(isChatModel('bge-large')).toBe(false)
    })
  })

  describe('isVisionModel', () => {
    it('should return true for vision models', () => {
      expect(isVisionModel('gpt-4o')).toBe(true)
      expect(isVisionModel('llava:7b')).toBe(true)
      expect(isVisionModel('gemma3:4b')).toBe(true)
      expect(isVisionModel('qwen3-vl:32b')).toBe(true)
    })

    it('should return false for non-vision models', () => {
      expect(isVisionModel('gpt-3.5-turbo')).toBe(false)
      expect(isVisionModel('llama3.3')).toBe(false)
      expect(isVisionModel('qwen3:4b')).toBe(false)
      expect(isVisionModel('text-embedding-3-small')).toBe(false)
    })
  })
})

describe('Model Classifier - Pattern Priority', () => {
  it('should prioritize vision patterns over chat patterns', () => {
    // gemma3 matches both /^gemma3/ (vision) and /^gemma/ (chat)
    // Should classify as vision+chat, not just chat
    const result = classifyModel('gemma3:4b')
    expect(result.isVisionModel).toBe(true)
    expect(result.isChatModel).toBe(true)
  })

  it('should prioritize vision patterns over embedding patterns for models with "embed" in name', () => {
    // A hypothetical "qwen3-vl-embed" would match both patterns
    // Vision should take priority (checked first in code)
    const result = classifyModel('qwen3-vl-embed')
    expect(result.isVisionModel).toBe(true)
    expect(result.isChatModel).toBe(true)
  })

  it('should prioritize embedding patterns over chat patterns', () => {
    // Model with "embed" should be embedding, not chat
    const result = classifyModel('new-model-embed')
    expect(result.isEmbeddingModel).toBe(true)
    expect(result.isChatModel).toBe(false)
  })
})

describe('Model Classifier - Unknown Models', () => {
  it('should default to chat model with low confidence for unknown models', () => {
    const result = classifyModel('unknown-model-xyz')
    expect(result.isChatModel).toBe(true)
    expect(result.isEmbeddingModel).toBe(false)
    expect(result.isVisionModel).toBe(false)
    expect(result.confidence).toBe('low')
  })

  it('should handle empty string gracefully', () => {
    const result = classifyModel('')
    expect(result.isChatModel).toBe(true)
    expect(result.confidence).toBe('low')
  })

  it('should be case-insensitive', () => {
    const lower = classifyModel('gpt-4o')
    const upper = classifyModel('GPT-4O')
    const mixed = classifyModel('GpT-4o')

    expect(lower).toEqual(upper)
    expect(lower).toEqual(mixed)
  })
})
