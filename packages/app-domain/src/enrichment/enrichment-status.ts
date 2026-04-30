export const EnrichmentStatusValues = ['pending', 'processing', 'completed', 'error', 'failed', 'canceled']
export type EnrichmentStatusType = (typeof EnrichmentStatusValues)[number]
