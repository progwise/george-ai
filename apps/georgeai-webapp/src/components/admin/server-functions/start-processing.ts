import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { ProcessType } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'

const startProcessingMutationDocument = graphql(`
  mutation StartWorkspaceProcessing($processType: ProcessType!) {
    startEventProcessing(processType: $processType)
  }
`)

export const startProcessingFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { processType: ProcessType }) => data)
  .handler(async (ctx) => {
    console.log('Starting processing with data:', ctx.data)
    const result = await backendRequest(startProcessingMutationDocument, { ...ctx.data })
    return result
  })
