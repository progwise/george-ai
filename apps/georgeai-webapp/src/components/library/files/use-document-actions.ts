import { useMutation } from '@tanstack/react-query'

import { ExtractionMethod } from '../../../gql/graphql'
import { toastError, toastSuccess } from '../../georgeToaster'
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
    onSuccess: (data) => {
      toastSuccess(`Extraction triggered for ${data.documentManifest.name}: ${data.extractionMethod} `)
    },
    onError: (error) => {
      toastError(`Failed to trigger extraction: ${(error as Error).message}`)
    },
  })

  const triggerVectorizationMutation = useMutation({
    mutationFn: (options: { extractionMethod?: ExtractionMethod }) =>
      triggerVectorizationFn({ data: { libraryId, documentId, ...options } }),
    onSuccess: (data) => {
      toastSuccess(`Vectorization triggered for ${data.documentManifest.name} `)
    },
    onError: (error) => {
      toastError(`Failed to trigger vectorization: ${(error as Error).message}`)
    },
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
