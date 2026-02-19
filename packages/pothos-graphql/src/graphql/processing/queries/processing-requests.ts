import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import {
  EmbedDocumentRequest,
  EnrichItemRequest,
  ExtractDocumentRequest,
  workspaceProcessing,
} from '@george-ai/event-service-client'

import { builder } from '../../builder'

const response = builder
  .objectRef<{
    totalCount: number
    lastSequence: number
    items: Array<{
      id: string
      subject: string
      deliveryCount: number
      request?: ExtractDocumentRequest | EmbedDocumentRequest | EnrichItemRequest | null
      error?: string
      rawText?: string
    }>
  }>('ProcessingRequestsResponse')
  .implement({
    fields: (t) => ({
      totalCount: t.exposeInt('totalCount'),
      lastSequence: t.exposeInt('lastSequence'),
      items: t.field({
        nullable: false,
        type: [
          builder
            .objectRef<{
              id: string
              subject: string
              deliveryCount: number
              request?: ExtractDocumentRequest | EmbedDocumentRequest | EnrichItemRequest | null
              error?: string
              rawText?: string
            }>('ProcessingRequestItem')
            .implement({
              fields: (t) => ({
                id: t.exposeString('id'),
                subject: t.exposeString('subject'),
                deliveryCount: t.exposeInt('deliveryCount'),
                request: t.expose('request', { type: 'ProcessingRequest', nullable: true }),
                error: t.exposeString('error', { nullable: true }),
                rawText: t.exposeString('rawText', { nullable: true }),
              }),
            }),
        ],
        resolve: (root) => {
          return root.items
        },
      }),
    }),
  })

builder.queryField('processingRequests', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: response,
    nullable: false,
    args: {
      requestType: t.arg({ type: 'ProcessingRequestType', required: false }),
      libraryId: t.arg.string({ required: false }),
      documentId: t.arg.string({ required: false }),
      startSequence: t.arg.int({ required: false, defaultValue: undefined }),
      take: t.arg.int({ defaultValue: 20 }),
    },
    resolve: async (_root, { requestType, startSequence, take, libraryId, documentId }, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)

      const response = await workspaceProcessing.getRequests(workspaceId, requestType, {
        libraryId,
        documentId,
        startSequence,
        take,
      })

      return response
    },
  }),
)
