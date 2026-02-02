import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { ProcessFileInput, ProcessFilesInput } from '../../../gql/graphql'
import { ProcessFileInputSchema, ProcessFilesInputSchema } from '../../../gql/validation'
import { backendRequest } from '../../../server-functions/backend'

export const processFileFn = createServerFn({ method: 'POST' })
  .inputValidator((data: ProcessFileInput) => ProcessFileInputSchema().parse(data))
  .handler(async ({ data }) => {
    return backendRequest(
      graphql(`
        mutation processFile($input: ProcessFileInput!) {
          processFile(input: $input) {
            success
          }
        }
      `),
      { input: data },
    )
  })

export const processFilesFn = createServerFn({ method: 'POST' })
  .inputValidator((data: ProcessFilesInput) => ProcessFilesInputSchema().parse(data))
  .handler(async ({ data }) => {
    return backendRequest(
      graphql(`
        mutation processFiles($input: ProcessFilesInput!) {
          processFiles(input: $input) {
            success
          }
        }
      `),
      { input: data },
    )
  })
