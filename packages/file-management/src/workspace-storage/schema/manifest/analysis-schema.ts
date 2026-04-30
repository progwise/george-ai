import z from 'zod'

import { DateTimeSchema } from './common'

export const AnalysisSchema = z.object({
  version: z.literal(1).describe('Analysis  schema version, used for future migrations'),
  analysisFileName: z
    .string()
    .min(1)
    .describe('The name of the analysis file, should be unique within the parent entity'),
  sourceFileUri: z
    .string()
    .min(3)
    .describe('The URI of the source file for this analysis, can be used to link back to the original attachment'),
  sourceFileName: z
    .string()
    .describe('The name of the source file for this analysis, can be used for display and debugging purposes'),
  sourceFileMimeType: z
    .string()
    .describe('The mime type of the source file for this analysis, can be used for display and debugging purposes'),
  created: DateTimeSchema,
  updated: DateTimeSchema.optional(),
})

export type Analysis = z.infer<typeof AnalysisSchema>
