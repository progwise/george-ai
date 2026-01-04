import z from 'zod'

import { FileConverterOptionsSchema, FileConverterResultSchema } from '@george-ai/file-converter'

import { ContentProcessingEventBaseSchema } from '../../shared/schemas'

export const ContentExtractionRequestEventSchema = ContentProcessingEventBaseSchema.extend({
  eventName: z.literal('content-extraction-request'),
  mimeType: z.string(),
  fileConverterOptions: FileConverterOptionsSchema,
})

export type ContentExtractionRequestEvent = z.infer<typeof ContentExtractionRequestEventSchema>

export const ContentExtractionFinishedEventSchema = ContentProcessingEventBaseSchema.extend({
  eventName: z.literal('content-extraction-finished'),
  fileConverterResult: FileConverterResultSchema,
})

export type ContentExtractionFinishedEvent = z.infer<typeof ContentExtractionFinishedEventSchema>
