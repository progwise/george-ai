import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { WorkspaceProcessingType } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'

const startProcessingMutationDocument = graphql(`
  mutation StartWorkspaceProcessing($processingType: WorkspaceProcessingType!) {
    startProcessing(processingType: $processingType)
  }
`)

export const startProcessingFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { processingType: WorkspaceProcessingType }) => data)
  .handler(async (ctx) => {
    console.log('Starting processing with data:', ctx.data)
    const result = await backendRequest(startProcessingMutationDocument, { ...ctx.data })
    return result
  })
