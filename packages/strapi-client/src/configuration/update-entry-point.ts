import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const updateEntryPoint = async (
  id: string,
  prompts: {
    id: string
    promptForSummary: string | null | undefined
    promptForKeywords: string | null | undefined
    largeLanguageModel: string
    isDefaultPrompt: boolean | undefined
    language: string
  }[],
) => {
  await strapiClient.request(
    graphql(`
      mutation UpdateEntryPoint($id: ID!, $data: EntryPointInput!) {
        updateEntryPoint(id: $id, data: $data) {
          data {
            id
          }
        }
      }
    `),
    {
      id,
      data: { prompts },
    },
  )
  console.log('Update EntryPoint with id:', id)
}
