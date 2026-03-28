import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'
import { AnalyzeImageRequest, publish } from '@george-ai/event-service-client'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('triggerFileAnalysis', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('TriggerFileAnalysisResult', {
      fields: (t) => ({
        success: t.boolean({ nullable: false }),
      }),
    }),
    args: {
      fileUri: t.arg.string({ required: true }),
      fileName: t.arg.string({ required: true }),
      mimeType: t.arg.string({ required: true }),
    },
    nullable: false,
    resolve: async (_parent, { fileUri, fileName, mimeType }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)

      const analyzeImageRequest: AnalyzeImageRequest = {
        version: 1,
        action: 'analyzeImage',
        imageUri: fileUri,
        workspaceId,
        fileName,
        mimeType,
        verb: 'request',
        timestamp: new Date(),
      }

      logger.debug('Publishing image analysis request for attachment', { ...analyzeImageRequest })
      await publish(analyzeImageRequest)
      return { success: true }
    },
  }),
)
