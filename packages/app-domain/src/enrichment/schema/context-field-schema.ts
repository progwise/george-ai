import { z } from 'zod'

import { LIST_FIELD_SOURCE_TYPES, LIST_FIELD_TYPES } from '../../list'

export const ContextFieldSchema = z.object({
  contextType: z.enum(['fieldReference', 'vectorSearch', 'webFetch', 'fullContent']),
  contextQuery: z.any().nullable().optional(),
  maxContentTokens: z.number().nullable().optional(),
  contextField: z
    .object({
      id: z.string(),
      name: z.string(),
      sourceType: z.enum(LIST_FIELD_SOURCE_TYPES),
      type: z.enum(LIST_FIELD_TYPES),
      fileProperty: z.string().nullable(),
      cachedValues: z.array(
        z.object({
          itemId: z.string(),
          valueString: z.string().nullable().optional(),
          valueNumber: z.number().nullable().optional(),
          valueBoolean: z.boolean().nullable().optional(),
          valueDate: z.date().nullable().optional(),
          valueDatetime: z.date().nullable().optional(),
          enrichmentErrorMessage: z.string().nullable().optional(),
        }),
      ),
    })
    .nullable()
    .optional(),
})
