import { MigrateFileRequest, MigrateFileStatus, publish } from '@george-ai/event-service-client'
import { migrateDocument } from '@george-ai/file-management'

import { WORKER_ID } from '../common'
import { logger } from './common'

export async function migrateFile(event: MigrateFileRequest) {
  logger.info('Migrating file for event', { event })

  const {
    workspaceId,
    libraryId,
    fileId,
    fileName,
    mimeType,
    createdAt,
    originUri,
    originFileHash,
    crawledByCrawlerId,
    uploadedAt,
    originModificationDate,
    docPath,
    hash,
  } = event

  const statusEvent: MigrateFileStatus = {
    version: 1,
    workspaceId,
    action: 'migrateFile',
    fileId,
    libraryId,
    status: 'started',
    timestamp: new Date(),
    message: `Worker ${WORKER_ID} got it`,
    verb: 'status',
  }

  await publish({ ...statusEvent, timestamp: new Date(), message: `Worker ${WORKER_ID} got it`, status: 'started' })

  try {
    await migrateDocument(workspaceId, {
      libraryId: libraryId,
      fileId: fileId,
      workspaceId: workspaceId,
      name: fileName,
      mimeType: mimeType,
      createdAt: createdAt,
      originUri: originUri,
      originFileHash: originFileHash,
      crawledByCrawlerId: crawledByCrawlerId,
      uploadedAt: uploadedAt,
      originModificationDate: originModificationDate,
      docPath: docPath,
      hash: hash,
    })
    await publish({
      ...statusEvent,
      timestamp: new Date(),
      message: `Worker ${WORKER_ID} finished it`,
      status: 'finished',
    })
    logger.info('Finished migrating file for event', { event })
  } catch (error) {
    logger.error('Error migrating file', { event, error })
    await publish({ ...statusEvent, timestamp: new Date(), message: `Worker ${WORKER_ID} got it`, status: 'failure' })
  }
}
