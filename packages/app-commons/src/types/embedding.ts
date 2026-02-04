export const EMBEDDING_STATUS = ['Ready', 'WorkspaceNotFound', 'UnknownModelConfig', 'ModelNotFound'] as const
export type EmbeddingStatus = (typeof EMBEDDING_STATUS)[number]
