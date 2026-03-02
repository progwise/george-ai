import z from 'zod'

export const OpenAIModelSchema = z.object({
  id: z.string(),
  object: z.literal('model'),
  created: z.number(),
  owned_by: z.string(),
})

export type OpenAIModel = z.infer<typeof OpenAIModelSchema>

export const OpenAIModelsResponseSchema = z.object({
  object: z.literal('list'),
  data: z.array(OpenAIModelSchema),
})

export const OpenAIEmbeddingResponseSchema = z.object({
  object: z.literal('list'),
  data: z.array(
    z.object({
      object: z.literal('embedding'),
      embedding: z.array(z.number()),
      index: z.number(),
    }),
  ),
  model: z.string(),
  usage: z.object({
    prompt_tokens: z.number(),
    total_tokens: z.number(),
  }),
})

export const OpenAIChatCompletionSchema = z.object({
  id: z.string(),
  object: z.literal('chat.completion'),
  created: z.number(),
  model: z.string(),
  system_fingerprint: z.string().optional().nullable(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.enum(['assistant', 'user', 'system', 'tool']),
        content: z.string().nullable(),
        tool_calls: z.array(z.any()).optional(), // Can be refined if using tools
      }),
      logprobs: z.null().or(
        z
          .object({
            content: z.array(z.any()).nullable(),
          })
          .optional(),
      ),
      finish_reason: z.enum(['stop', 'length', 'tool_calls', 'content_filter', 'function_call']),
    }),
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
    completion_tokens_details: z.record(z.any()).optional(), // For reasoning tokens, etc.
  }),
})

export const OpenAIChatCompletionChunkSchema = z
  .object({
    id: z.string(),
    object: z.literal('chat.completion.chunk'),
    created: z.number(),
    model: z.string(),
    choices: z.array(
      z.object({
        index: z.number(),
        delta: z.object({
          role: z.enum(['system', 'user', 'assistant', 'tool']).optional(),
          content: z.string().nullable().optional(), // Can be null for tool calls
          reasoning_content: z.string().optional(), // For models with reasoning capabilities (e.g., o1)
          refusal: z.string().nullable().optional(), // Content moderation refusal message
          tool_calls: z
            .array(
              z.object({
                index: z.number(),
                id: z.string().optional(),
                type: z.literal('function').optional(),
                function: z
                  .object({
                    name: z.string().optional(),
                    arguments: z.string().optional(), // JSON string, streamed incrementally
                  })
                  .optional(),
              }),
            )
            .optional(), // For function calling (current API)
          function_call: z
            .object({
              name: z.string().optional(),
              arguments: z.string().optional(), // JSON string, streamed incrementally
            })
            .optional(), // Legacy function calling (deprecated but still supported)
          audio: z
            .object({
              id: z.string(),
              data: z.string(), // Base64 encoded audio data
              transcript: z.string().optional(),
            })
            .nullable()
            .optional(), // For audio generation models
        }),
        finish_reason: z.enum(['stop', 'length', 'content_filter', 'tool_calls', 'function_call']).nullable(),
        logprobs: z.unknown().nullable().optional(),
      }),
    ),
    usage: z
      .object({
        prompt_tokens: z.number(),
        completion_tokens: z.number(),
        total_tokens: z.number(),
      })
      .nullable()
      .optional(), // Can be null, undefined, or an object
    system_fingerprint: z.string().nullable().optional(), // Can be null or undefined
  })
  .passthrough() // Allow additional fields like service_tier, obfuscation, etc.

export type OpenAIChatCompletionChunk = z.infer<typeof OpenAIChatCompletionChunkSchema>

export const OpenAIChatStreamChunkSchema = z.object({
  modelName: z.string(), // Track which model this chunk is from
  id: z.string(),
  created: z.number(),
  delta: z.object({
    role: z.enum(['system', 'user', 'assistant', 'tool']).optional(),
    content: z.string().nullable().optional(),
    reasoning_content: z.string().optional(),
    refusal: z.string().nullable().optional(),
    tool_calls: z
      .array(
        z.object({
          index: z.number(),
          id: z.string().optional(),
          type: z.literal('function').optional(),
          function: z
            .object({
              name: z.string().optional(),
              arguments: z.string().optional(),
            })
            .optional(),
        }),
      )
      .optional(),
    function_call: z
      .object({
        name: z.string().optional(),
        arguments: z.string().optional(),
      })
      .optional(),
    audio: z
      .object({
        id: z.string(),
        data: z.string(),
        transcript: z.string().optional(),
      })
      .nullable()
      .optional(),
  }),
  finish_reason: z.enum(['stop', 'length', 'content_filter', 'tool_calls', 'function_call']).nullable(),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    })
    .nullable()
    .optional(), // Can be null, undefined, or an object
  done: z.boolean().optional(), // Indicates stream completion
})

export type OpenAIChatStreamChunk = z.infer<typeof OpenAIChatStreamChunkSchema>
