import z from 'zod'

import { FieldEnrichmentRequestSchema, FieldEnrichmentStatusSchema } from './field'

export * from './field'

export const FieldEnrichmentEventSchema = z.discriminatedUnion('verb', [
  FieldEnrichmentRequestSchema,
  FieldEnrichmentStatusSchema,
])

export type FieldEnrichmentEvent = z.infer<typeof FieldEnrichmentEventSchema>
