import { useMutation } from '@tanstack/react-query'

import { ExtractionMethod } from '../../../gql/graphql'
import { prepareSourceUpload, triggerExtractionFn, triggerVectorizationFn } from '../server-functions'

export const useDocumentActions = (parameters: { libraryId: string; documentId: string }) => {
  const { libraryId, documentId } = parameters
  const prepareSourceUploadMutation = useMutation({
    mutationFn: (data: { name: string; originUri: string; mimeType: string; size: number; modificationDate?: Date }) =>
      prepareSourceUpload({ data: { ...data, libraryId, documentId } }),
  })

  const triggerExtractionMutation = useMutation({
    mutationFn: (options: { extractionMethod?: ExtractionMethod }) =>
      triggerExtractionFn({ data: { libraryId, documentId, ...options } }),
  })

  const triggerVectorizationMutation = useMutation({
    mutationFn: (options: { extractionMethod?: ExtractionMethod }) =>
      triggerVectorizationFn({ data: { libraryId, documentId, ...options } }),
  })

  return {
    prepareSourceUpload: prepareSourceUploadMutation.mutate,
    triggerExtraction: triggerExtractionMutation.mutate,
    triggerVectorization: triggerVectorizationMutation.mutate,
    isPending:
      prepareSourceUploadMutation.isPending ||
      triggerExtractionMutation.isPending ||
      triggerVectorizationMutation.isPending,
  }
}
