import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { AiLibraryInputSchema } from '../../gql/validation'
import { backendRequest } from '../../server-functions/backend'

const updateLibraryDocument = graphql(`
  mutation changeAiLibrary($id: String!, $data: AiLibraryInput!) {
    updateAiLibrary(id: $id, data: $data) {
      ...AiLibraryDetail
    }
  }
`)

export const updateLibrary = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) {
      throw new Error('Invalid form data')
    }

    const libraryId = z
      .string()
      .nonempty()
      .parse(data.get('libraryId') as string)

    const embeddingModel = data.get('embeddingModel') as string
    const embeddingUrl = data.get('embeddingUrl') as string
    const embeddingOptions = data.get('embeddingOptions') as string

    const library = AiLibraryInputSchema().parse({
      name: data.get('name') as string,
      description: data.get('description') as string,
      url: data.get('url') as string,
      ...(embeddingModel && {
        embedding: {
          name: embeddingModel,
          model: embeddingModel,
          provider: 'Ollama', // Default provider based on getEmbeddingModels implementation
          url: embeddingUrl || null,
          headers: null,
          options: embeddingOptions || null,
        },
      }),
    })
    return { libraryId, library }
  })
  .handler(async (ctx) => {
    return await backendRequest(updateLibraryDocument, {
      data: ctx.data.library,
      id: ctx.data.libraryId,
    })
  })
