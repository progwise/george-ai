import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const deleteLibraryDocument = graphql(`
  mutation deleteLibrary($id: String!) {
    deleteLibrary(id: $id) {
      id
      name
      filesCount
    }
  }
`)

export const deleteLibraryFn = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(deleteLibraryDocument, { id: ctx.data })
  })
