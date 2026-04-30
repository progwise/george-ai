import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const TriggerFileAnalysisParameterSchema = z.object({
  fileUri: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
})

export const triggerFileAnalysisFn = createServerFn({ method: 'POST' })
  .inputValidator((data: z.infer<typeof TriggerFileAnalysisParameterSchema>) =>
    TriggerFileAnalysisParameterSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation triggerFileAnalysis($fileUri: String!, $fileName: String!, $mimeType: String!) {
          triggerFileAnalysis(fileUri: $fileUri, fileName: $fileName, mimeType: $mimeType) {
            success
          }
        }
      `),
      {
        fileUri: data.fileUri,
        fileName: data.fileName,
        mimeType: data.mimeType,
      },
    )

    return result.triggerFileAnalysis
  })
