import {
  EmbedFileRequest,
  EnrichItemRequest,
  ExtractFileRequest,
  ProcessingRequest,
} from '@george-ai/event-service-client'

import { builder } from '../builder'
import { logger } from '../common'

builder.interfaceRef<ProcessingRequest>('ProcessingRequest').implement({
  resolveType: (request) => {
    switch (request.requestType) {
      case 'extractFile':
        return 'ExtractFileRequest'
      case 'embedFile':
        return 'EmbedFileRequest'
      case 'enrichItem':
        return 'EnrichItemRequest'
      default:
        logger.error('Unknown request type for ProcessingRequest', { request })
        throw new Error(`Unknown request type: ${JSON.stringify(request)}`)
    }
  },
  // TODO: add fileId and libraryId to the interface and remove from individual types, since they are common across all types
  fields: (t) => ({
    version: t.exposeInt('version'),
    workspaceId: t.exposeString('workspaceId'),
    requestType: t.exposeString('requestType'),
    settings: t.field({
      type: [
        builder.simpleObject('ProcessingRequestSettingItem', {
          fields: (t) => ({
            key: t.string(),
            value: t.string(),
          }),
        }),
      ],
      resolve: (root) => {
        if (!root.settings) {
          return []
        }
        return Object.entries(root.settings).map(([key, value]) => ({
          key,
          value: String(value),
        }))
      },
    }),
  }),
})

builder.objectRef<ExtractFileRequest>('ExtractFileRequest').implement({
  interfaces: ['ProcessingRequest'],
  fields: (t) => ({
    libraryId: t.exposeString('libraryId'),
    fileId: t.exposeString('fileId'),
    extractionMethod: t.exposeString('extractionMethod'),
  }),
})

builder.objectRef<EmbedFileRequest>('EmbedFileRequest').implement({
  interfaces: ['ProcessingRequest'],
  fields: (t) => ({
    libraryId: t.exposeString('libraryId'),
    fileId: t.exposeString('fileId'),
    extractionMethod: t.exposeString('extractionMethod'),
    embeddingModelProvider: t.field({
      type: 'ModelProvider',
      resolve: (root) => {
        return root.embeddingModelProvider
      },
    }),
    embeddingModelName: t.exposeString('embeddingModelName'),
  }),
})

builder.objectRef<EnrichItemRequest>('EnrichItemRequest').implement({
  interfaces: ['ProcessingRequest'],
  fields: (t) => ({
    libraryId: t.exposeString('libraryId'),
    fileId: t.exposeString('fileId'),
    fragment: t.exposeInt('fragment', { nullable: true }),
  }),
})
