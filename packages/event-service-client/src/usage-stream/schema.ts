import z from 'zod'

export const UsageTrackingEventSchema = z.object({
  eventName: z.literal('usage-tracking'),
  workspaceId: z.string(),
  libraryId: z.string().optional(),
  fileId: z.string().optional(),
  listId: z.string().optional(),
  fieldId: z.string().optional(),
  automationId: z.string().optional(),
  modelName: z.string(),
  modelProvider: z.string(),
  operation: z.enum(['embed', 'chat', 'vision']),
  tokensUsed: z.number(),
  duration: z.number(),
  success: z.boolean(),
  errorMessage: z.string().optional(),
  timestamp: z.string().datetime(),
})

export type UsageTrackingEvent = z.infer<typeof UsageTrackingEventSchema>
