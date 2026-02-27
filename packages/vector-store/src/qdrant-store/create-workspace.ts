import { Schemas } from '@qdrant/js-client-rest'

import { getCollectionName, logger, qdrantClient } from './common'

const ensurePayloadIndex = async (
  collectionName: string,
  collectionInfo: Schemas['CollectionInfo'],
  fieldName: string,
  schemaType: 'keyword' | 'integer' | 'text' | 'datetime',
) => {
  const existingIndexes = collectionInfo.payload_schema || {}

  if (existingIndexes[fieldName]) {
    logger.debug(`Index for field already exists. Skipping.`, { collectionName, fieldName })
    return
  }

  // 3. Create the index if it's missing
  logger.debug(`Creating index for field.`, { collectionName, fieldName, schemaType })
  await qdrantClient.createPayloadIndex(collectionName, {
    field_name: fieldName,
    field_schema: schemaType, // e.g., 'keyword', 'integer', 'text', 'datetime'
    wait: true,
  })
}

export async function createWorkspace(parameters: {
  workspaceId: string
  vectors: {
    // TODO: model names are defined on library level
    [modelName: string]: {
      size: number
      distance: 'Cosine' | 'Dot' | 'Euclid' | 'Manhattan'
    }
  }
}): Promise<void> {
  const { workspaceId, vectors } = parameters
  const collectionName = getCollectionName(workspaceId)
  const { exists } = await qdrantClient.collectionExists(collectionName)
  if (exists) {
    logger.error(`Collection for workspace already exists`, { workspaceId })
    throw new Error(`Collection for workspace already exists: ${workspaceId}`)
  }
  logger.info(`Creating Qdrant collection for workspace`, { workspaceId, collectionName, vectors })
  await qdrantClient.createCollection(collectionName, {
    vectors,
  })
  const collectionInfo = await qdrantClient.getCollection(collectionName)
  await Promise.all([
    ensurePayloadIndex(collectionName, collectionInfo, 'libraryId', 'keyword'),
    ensurePayloadIndex(collectionName, collectionInfo, 'fileId', 'keyword'),
    ensurePayloadIndex(collectionName, collectionInfo, 'chunk', 'integer'),
    ensurePayloadIndex(collectionName, collectionInfo, 'fragment', 'integer'),
    ensurePayloadIndex(collectionName, collectionInfo, 'filename', 'text'),
    ensurePayloadIndex(collectionName, collectionInfo, 'filePath', 'text'),
    ensurePayloadIndex(collectionName, collectionInfo, 'content', 'text'),
    ensurePayloadIndex(collectionName, collectionInfo, 'fileHash', 'keyword'),
    ensurePayloadIndex(collectionName, collectionInfo, 'fileSizeBytes', 'integer'),
    ensurePayloadIndex(collectionName, collectionInfo, 'fileMimeType', 'text'),
    ensurePayloadIndex(collectionName, collectionInfo, 'fileCreatedAt', 'datetime'),
    ensurePayloadIndex(collectionName, collectionInfo, 'fileUpdatedAt', 'datetime'),
    ensurePayloadIndex(collectionName, collectionInfo, 'fileUploadedAt', 'datetime'),
    ensurePayloadIndex(collectionName, collectionInfo, 'creationAuthor', 'text'),
    ensurePayloadIndex(collectionName, collectionInfo, 'updateAuthor', 'text'),
  ])
}
