import { getCollectionName, logger, qdrantClient } from './common'

export async function updateWorkspace(parameters: {
  workspaceId: string
  vectors: {
    [modelName: string]: {
      size: number
      distance: 'Cosine' | 'Dot' | 'Euclid' | 'Manhattan'
    }
  }
  existingModelConfigs: {
    modelName: string
    dimensions: number
    distance: string
  }[]
}): Promise<void> {
  const { workspaceId, vectors, existingModelConfigs } = parameters
  const collectionName = getCollectionName(workspaceId)

  const existingByName = new Map(existingModelConfigs.map((c) => [c.modelName, c]))
  const newVectors: typeof vectors = {}

  for (const [modelName, vectorConfig] of Object.entries(vectors)) {
    const existing = existingByName.get(modelName)
    if (!existing) {
      logger.info('Adding new vector config to existing workspace collection', {
        workspaceId,
        modelName,
        size: vectorConfig.size,
      })
      newVectors[modelName] = vectorConfig
    } else if (existing.dimensions !== vectorConfig.size) {
      logger.warn(
        'Vector dimension mismatch for existing model — cannot update dimensions without recreating the collection. Skipping.',
        {
          workspaceId,
          modelName,
          existingDimensions: existing.dimensions,
          newDimensions: vectorConfig.size,
        },
      )
    }
  }

  if (Object.keys(newVectors).length === 0) {
    logger.debug('No new vector configs to add to workspace collection', { workspaceId })
    return
  }

  await qdrantClient.updateCollection(collectionName, { vectors: newVectors })
}
