import z from 'zod'

import { WorkspaceResponseBaseSchema } from './base-schema'

export const ErrorResponseSchema = WorkspaceResponseBaseSchema.extend({
  success: z.literal(false),
  error: z.string(),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
