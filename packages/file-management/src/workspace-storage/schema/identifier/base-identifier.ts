import z from 'zod'

export const IDENTIFIER_TYPES = ['workspace', 'library', 'document', 'extraction', 'attachment', 'fragment'] as const
export type IdentifierType = (typeof IDENTIFIER_TYPES)[number]

export const BaseIdentifierSchema = z.object({
  version: z.literal(1).describe('Identifier schema version, used for future migrations'),
  type: z.enum(IDENTIFIER_TYPES),
})
