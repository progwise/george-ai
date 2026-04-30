import z from 'zod'

import { LIST_FIELD_TYPES } from '../../list'
import { ContextFieldSchema } from './context-field-schema'

export const ValidatedFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  languageModelId: z.string(),
  languageProvider: z.string().nullable().optional(),
  languageModelName: z.string(),
  prompt: z.string().min(1, 'Prompt is required'),
  type: z.enum(LIST_FIELD_TYPES),
  fileProperty: z.null(),
  sourceType: z.literal('llm_computed'),
  failureTerms: z.string().nullable(),
  listId: z.string(),
  context: z.array(ContextFieldSchema),
})

export type ValidatedField = z.infer<typeof ValidatedFieldSchema>
