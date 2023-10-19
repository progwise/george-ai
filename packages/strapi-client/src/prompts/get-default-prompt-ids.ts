import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const getDefaultPromptIds = async (): Promise<string[]> => {
  const { prompts } = await strapiClient.request(
    graphql(`
      query GetDefaultPrompts {
        prompts(locale: "all", filters: { isDefaultPrompt: { eq: true } }) {
          data {
            id
          }
        }
      }
    `),
    {},
  )

  return (
    prompts?.data
      .map((item) => item.id)
      .filter((id): id is string => typeof id === 'string') || []
  )
}
