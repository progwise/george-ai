export const retrievalFlowValues = [
  'Sequential',
  'Parallel',
  'onlyLocal',
  'onlyWeb',
] as const

export type RetrievalFlow = (typeof retrievalFlowValues)[number]
