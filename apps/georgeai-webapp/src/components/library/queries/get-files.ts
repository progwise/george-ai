import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getFiles = createServerFn({ method: 'GET' })
  .inputValidator((data: object) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        documentId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    const result = await backendRequest(
      graphql(`
        query DocumentFiles($libraryId: String!, $documentId: String!) {
          documentFiles(libraryId: $libraryId, documentId: $documentId) {
            fileName
            relativePath
            mimeType
            fileType
            size
            modified
            fileUri
            extractionMethod
            workspaceId
            libraryId
            documentId
            isDocumentRoot
            isAnalysis
            isBackup
            isExtractionMain
            isExtractionPart
            isManifest
            isDocumentSourceFile
            isAttachment
          }
        }
      `),
      { ...ctx.data },
    )
    return result.documentFiles
  })

export const getFilesQueryOptions = (params: { libraryId: string; documentId: string }) =>
  queryOptions({
    queryKey: [queryKeys.Documents, { ...params }],
    queryFn: async () =>
      getFiles({
        data: {
          libraryId: params.libraryId,
          documentId: params.documentId,
        },
      }),
  })
