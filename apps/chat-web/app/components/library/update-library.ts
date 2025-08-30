import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { AiLibraryInputSchema } from '../../gql/validation'
import { Language, getLanguage, translate } from '../../i18n'
import { backendRequest } from '../../server-functions/backend'

const updateLibraryDocument = graphql(`
  mutation changeLibrary($id: String!, $data: AiLibraryInput!) {
    updateLibrary(id: $id, data: $data) {
      ...AiLibraryDetail
    }
  }
`)

export const getLibraryUpdateFormSchema = (language: Language) =>
  z.object({
    id: z.string().nonempty(),
    name: z.string().min(1, translate('errors.requiredField', language)),
    description: z.string().nullish(),
    embeddingModelName: z.string().nullish(),
    fileConverterOptions: z.string().nullish(),
  })

export const updateLibrary = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const o = Object.fromEntries(data)
    const language = await getLanguage()
    const schema = getLibraryUpdateFormSchema(language)
    const parsedData = schema.parse(o)
    return {
      id: parsedData.id,
      input: AiLibraryInputSchema().parse({
        name: parsedData.name,
        description: parsedData.description,
        embeddingModelName: parsedData.embeddingModelName,
        fileConverterOptions: parsedData.fileConverterOptions,
      }),
    }
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(updateLibraryDocument, {
      data: data.input,
      id: data.id,
    })
  })
