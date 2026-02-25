import { useMutation } from '@tanstack/react-query'

import { ExtractionMethod, ProcessingRequestType } from '@george-ai/app-commons'

import { prepareSourceUpload, processDocumentFn, triggerExtractionFn } from '../server-functions'

export const useDocumentActions = (parameters: { libraryId: string; documentId: string }) => {
  const { libraryId, documentId } = parameters
  const prepareSourceUploadMutation = useMutation({
    mutationFn: (data: { name: string; originUri: string; mimeType: string; size: number; modificationDate?: Date }) =>
      prepareSourceUpload({ data: { ...data, libraryId, documentId } }),
  })

  const processDocumentMutation = useMutation({
    mutationFn: (requestType: ProcessingRequestType) =>
      processDocumentFn({ data: { libraryId, documentId, requestType } }),
  })

  const triggerExtractionMutation = useMutation({
    mutationFn: (extractionMethod: ExtractionMethod) =>
      triggerExtractionFn({ data: { libraryId, documentId, extractionMethod } }),
  })

  return {
    prepareSourceUpload: prepareSourceUploadMutation.mutate,
    processDocument: processDocumentMutation.mutate,
    triggerExtraction: triggerExtractionMutation.mutate,
    isPending:
      prepareSourceUploadMutation.isPending || processDocumentMutation.isPending || triggerExtractionMutation.isPending,
  }
}
