import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { PROCESSING_REQUEST_TYPES, ProcessingRequestType } from '@george-ai/app-commons'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const processFileFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { requestType: ProcessingRequestType; libraryId: string; fileId: string }) =>
    z
      .object({
        requestType: z.enum(PROCESSING_REQUEST_TYPES),
        libraryId: z.string(),
        fileId: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    return backendRequest(
      graphql(`
        mutation processFile($requestType: ProcessingRequestType!, $libraryId: String!, $fileId: String!) {
          processFile(requestType: $requestType, libraryId: $libraryId, fileId: $fileId) {
            success
          }
        }
      `),
      { requestType: data.requestType, libraryId: data.libraryId, fileId: data.fileId },
    )
  })

export const processFilesFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { requestType: ProcessingRequestType; libraryId: string; fileIds: string[] }) =>
    z
      .object({
        requestType: z.enum(PROCESSING_REQUEST_TYPES),
        libraryId: z.string(),
        fileIds: z.array(z.string()),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    return backendRequest(
      graphql(`
        mutation processFiles($requestType: ProcessingRequestType!, $libraryId: String!, $fileIds: [String!]!) {
          processFiles(requestType: $requestType, libraryId: $libraryId, fileIds: $fileIds) {
            success
          }
        }
      `),
      data,
    )
  })
