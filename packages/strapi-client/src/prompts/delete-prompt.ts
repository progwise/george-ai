import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const deletePrompt = async (id: string) => {
  try {
    const { deletePrompt } = await strapiClient.request(
      graphql(`
        mutation DeletePrompt($id: ID!) {
          deletePrompt(id: $id) {
            data {
              id
            }
          }
        }
      `),
      { id },
    )
  } catch (error) {
    console.error('Error while deleting DefaultPrompts:', error)
    throw error
  }
}
