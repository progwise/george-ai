import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { ProcessingRequestType } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'

export const startProcessingFn = createServerFn({ method: 'POST' })
  .inputValidator((data) =>
    z
      .object({
        requestType: z.nativeEnum(ProcessingRequestType),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation StartWorkspaceProcessing($requestType: ProcessingRequestType!) {
          startProcessing(requestType: $requestType) {
            success
          }
        }
      `),
      data,
    )
    return result
  })
