import z from 'zod'

export const LIBRARY_ACTIONS = ['documentExtraction', 'documentVectorization'] as const
export type LibraryAction = (typeof LIBRARY_ACTIONS)[number]
export const LibraryActionSchema = z.enum(LIBRARY_ACTIONS)
