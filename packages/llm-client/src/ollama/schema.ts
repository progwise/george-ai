import z from 'zod'

export const OllamaModelSchema = z.object({
  name: z.string(),
  model: z.string(),
  size: z.number(),
  digest: z.string().optional(),
  details: z
    .object({
      parameter_size: z.string().optional(),
      quantization_level: z.string().optional(),
      family: z.string().optional(),
      families: z.array(z.string()).optional(),
      parent_model: z.string().optional(),
      format: z.string().optional(),
    })
    .optional(),
})

export type OllamaModel = z.infer<typeof OllamaModelSchema>

export const OllamaModelsResponseSchema = z.object({
  models: z.array(OllamaModelSchema),
})

export const OllamaModelInfoSchema = z.object({
  modelfile: z.string(),
  parameters: z.string().optional(),
  template: z.string(),
  details: z.object({
    parent_model: z.string(),
    format: z.string(),
    family: z.string(),
    families: z.array(z.string()),
    parameter_size: z.string(), // e.g. "8.0B"
    quantization_level: z.string(), // e.g. "Q4_0"
  }),
  model_info: z
    .object({
      'general.architecture': z.string().optional(),
      'general.file_type': z.number().optional(),
      'general.parameter_count': z.number().optional(),
      'general.quantization_version': z.number().optional(),

      'llama.attention.head_count': z.number().optional(),
      'llama.attention.head_count_kv': z.number().optional(),
      'llama.attention.layer_norm_rms_epsilon': z.number().optional(),
      'llama.block_count': z.number().optional(),
      'llama.context_length': z.number().optional(),
      'llama.embedding_length': z.number().optional(),
      'llama.feed_forward_length': z.number().optional(),
      'llama.rope.dimension_count': z.number().optional(),
      'llama.rope.freq_base': z.number().optional(),
      'llama.vocab_size': z.number().optional(),

      'tokenizer.ggml.bos_token_id': z.number().optional(),
      'tokenizer.ggml.eos_token_id': z.number().optional(),
      'tokenizer.ggml.merges': z.array(z.any()).nullable().optional(),
      'tokenizer.ggml.model': z.string().optional(),
      'tokenizer.ggml.pre': z.string().optional(),
      'tokenizer.ggml.token_type': z.array(z.any()).nullable().optional(),
      'tokenizer.ggml.tokens': z.array(z.any()).nullable().optional(),
    })
    // Allow unknown/extra keys that some models expose:
    .passthrough(),
})

export type OllamaModelInfo = z.infer<typeof OllamaModelInfoSchema> & { timestamp: number }

export const OllamaVersionSchema = z.object({
  version: z.string().optional(),
})

export type OllamaVersion = z.infer<typeof OllamaVersionSchema> & { timestamp: number }

export const OllamaRunningModelSchema = z.object({
  name: z.string(),
  model: z.string(),
  digest: z.string(),
  size: z.number(),
  size_vram: z.number(),
  expires_at: z.string(),
  details: z.object({
    parent_model: z.string(),
    format: z.string(),
    family: z.string(),
    families: z.array(z.string()),
    parameter_size: z.string(),
    quantization_level: z.string(),
  }),
})

export type OllamaRunningModel = z.infer<typeof OllamaRunningModelSchema>

export const OllamaRunningModelsResponseSchema = z.object({
  models: z.array(OllamaRunningModelSchema),
})

export const OllamaChatCompletionSchema = z.object({
  model: z.string(),
  created_at: z.string(),
  message: z.object({
    role: z.enum(['assistant', 'user', 'system']),
    content: z.string(),
  }),
  done: z.boolean(),
  done_reason: z.string().optional(), // Added this based on your data
  total_duration: z.number().optional(),
  load_duration: z.number().optional(),
  prompt_eval_count: z.number().optional(),
  prompt_eval_duration: z.number().optional(),
  eval_count: z.number().optional(),
  eval_duration: z.number().optional(),
  // Note: context is removed as it's not present in /api/chat
})

export const OllamaChatStreamChunkSchema = z.object({
  model: z.string().optional(),
  modelName: z.string(), // Added field to track which model this chunk is from
  message: z
    .object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().optional(),
      thinking: z.string().optional(),
      images: z.array(z.string()).optional(), // base64 encoded images
    })
    .optional(),
  error: z.string().optional(),
  done: z.boolean().optional(), // Error-only chunks might not have done field
  context: z.array(z.number()).optional(),
  total_duration: z.number().optional(),
  load_duration: z.number().optional(),
  prompt_eval_count: z.number().optional(),
  prompt_eval_duration: z.number().optional(),
  eval_count: z.number().optional(),
  eval_duration: z.number().optional(),
})

export type OllamaStreamChunk = z.infer<typeof OllamaChatStreamChunkSchema>

export const OllamaEmbeddingResponseSchema = z.object({
  prompt_eval_count: z.number(),
  model: z.string(),
  total_duration: z.number(),
  load_duration: z.number(),
  embeddings: z.array(z.array(z.number())),
})

export type OllamaEmbeddingResponse = z.infer<typeof OllamaEmbeddingResponseSchema>
