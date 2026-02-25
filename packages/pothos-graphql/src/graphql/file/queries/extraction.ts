import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { document, extraction as ex } from '@george-ai/file-management'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.queryField('extraction', (t) => {
  return t.withAuth({ isLoggedIn: true }).field({
    type: 'ExtractionManifest',
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
        const file = await document.get({ workspaceId, libraryId, documentId: fileId })
        if (!file?.extractions || file.extractions.length < 1) {
          logger.warn('File or Extraction not found when trying to resolve extraction', {
            workspaceId,
            libraryId,
            fileId,
          })
          return null
        }
        const latestExtraction = file.extractions.sort((a, b) => b.created.getTime() - a.created.getTime())[0]

        if (!latestExtraction?.extractionMethod) {
          logger.warn('Latest extraction missing extractionMethod when trying to resolve extraction', {
            workspaceId,
            libraryId,
            fileId,
          })
          return null
        }

        extractionMethod = latestExtraction.extractionMethod
      }

      const extraction = await ex.get(workspaceId, {
        libraryId,
        documentId: fileId,
        extractionMethod,
      })
      return extraction
    },
  })
})
