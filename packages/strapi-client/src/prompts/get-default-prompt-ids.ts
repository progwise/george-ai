import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const getDefaultPromptIds = async () => {
  try {
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

    return prompts?.data
      .map((item) => item.id)
      .filter((id): id is string => typeof id === 'string')
  } catch (error) {
    console.error('Error while fetching DefaultPrompts:', error)
    throw error
  }
}
