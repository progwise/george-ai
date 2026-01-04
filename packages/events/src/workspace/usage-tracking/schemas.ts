import z from 'zod'

export const AiUsageTrackingEventSchema = z.object({
  eventName: z.literal('ai-usage-tracking'),
  workspaceId: z.string(),
  modelId: z.string(),
  operation: z.enum(['embed', 'chat', 'vision']),
  tokensUsed: z.number(),
  duration: z.number(),
  success: z.boolean(),
  errorMessage: z.string().optional(),
  timestamp: z.string().datetime(),
})

export type AiUsageTrackingEvent = z.infer<typeof AiUsageTrackingEventSchema>
