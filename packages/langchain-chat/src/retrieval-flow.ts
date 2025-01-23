export const retrievalFlowValues = [
  'Sequential',
  'Parallel',
  'Only Local',
  'Only Web',
  `Model Reasoning`,
] as const

export type RetrievalFlow = (typeof retrievalFlowValues)[number]
