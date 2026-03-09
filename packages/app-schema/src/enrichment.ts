import z from 'zod'

export const ENRICHMENT_ACTIONS = ['fieldEnrichment'] as const
export type EnrichmentAction = (typeof ENRICHMENT_ACTIONS)[number]
export const EnrichmentActionSchema = z.enum(ENRICHMENT_ACTIONS)
