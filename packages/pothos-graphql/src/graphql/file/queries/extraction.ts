import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { workspaceStorage } from '@george-ai/file-management'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.queryField('extraction', (t) => {
  return t.withAuth({ isLoggedIn: true }).field({
    type: 'ExtractionMetadata',
    nullable: true,
    args: {
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: true }),
      extractionMethod: t.arg({
        required: false,
        type: 'ExtractionMethod',
      }),
    },
    resolve: async (_source, { libraryId, fileId, extractionMethod }, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      if (!extractionMethod) {
        const file = await workspaceStorage.getFile(workspaceId, {
          libraryId,
          fileId,
        })
        if (!file?.extractions || file.extractions.length < 1) {
          logger.warn('File or Extraction not found when trying to resolve extraction', {
            workspaceId,
            libraryId,
            fileId,
          })
          return null
        }
        extractionMethod = file.extractions[0].extractionMethod
      }

      const extraction = await workspaceStorage.getExtraction(workspaceId, {
        libraryId,
        fileId,
        extractionMethod,
      })
      return extraction
    },
  })
})
