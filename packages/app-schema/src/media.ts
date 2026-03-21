import z from 'zod'

export const MEDIA_ACTIONS = ['analyzeImage', 'analyzeVideo'] as const
export type MediaAction = (typeof MEDIA_ACTIONS)[number]
export const MediaActionSchema = z.enum(MEDIA_ACTIONS)
