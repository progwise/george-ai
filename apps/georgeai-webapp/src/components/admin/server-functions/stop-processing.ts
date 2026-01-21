import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { ProcessType } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'

const stopProcessingMutationDocument = graphql(`
  mutation StopWorkspaceProcessing($processType: ProcessType!) {
    stopEventProcessing(processType: $processType)
  }
`)

export const stopProcessingFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { processType: ProcessType }) => data)
  .handler(async (ctx) => {
    const result = await backendRequest(stopProcessingMutationDocument, { ...ctx.data })
    return result
  })
