export const retrievalFlowValues = [
  'Sequential',
  'Parallel',
  'Only Local',
  'Only Web',
] as const

export type RetrievalFlow = (typeof retrievalFlowValues)[number]
