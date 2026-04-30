import { useMutation } from '@tanstack/react-query'

import { triggerFileAnalysisFn } from '../server-functions'

export const useDocumentFileActions = () => {
  const triggerAnalysisMutation = useMutation({
    mutationFn: async (params: { fileName: string; mimeType: string; fileUri: string }) => {
      const response = await triggerFileAnalysisFn({
        data: {
          fileName: params.fileName,
          mimeType: params.mimeType,
          fileUri: params.fileUri,
        },
      })
      return response
    },
  })

  return {
    triggerAnalysis: triggerAnalysisMutation.mutate,
    isPending: triggerAnalysisMutation.isPending,
  }
}
