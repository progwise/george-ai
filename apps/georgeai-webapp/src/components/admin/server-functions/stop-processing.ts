import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { WorkspaceProcessingType } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'

const stopProcessingMutationDocument = graphql(`
  mutation StopWorkspaceProcessing($processingType: WorkspaceProcessingType!) {
    stopProcessing(processingType: $processingType)
  }
`)

export const stopProcessingFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { processingType: WorkspaceProcessingType }) => data)
  .handler(async (ctx) => {
    const result = await backendRequest(stopProcessingMutationDocument, { ...ctx.data })
    return result
  })
