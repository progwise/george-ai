import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const deleteFilesDocument = graphql(`
  mutation deleteLibraryFiles($libraryId: String!) {
    deleteLibraryFiles(libraryId: $libraryId)
  }
`)
export const deleteFilesFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(deleteFilesDocument, { libraryId: ctx.data })
  })
