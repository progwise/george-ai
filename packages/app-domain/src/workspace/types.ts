export const WORKSPACE_PROCESSING_TYPE = ['EXTRACTION', 'EMBEDDING', 'AUTOMATION', 'ENRICHMENT'] as const
export type WorkspaceProcessingType = (typeof WORKSPACE_PROCESSING_TYPE)[number]
