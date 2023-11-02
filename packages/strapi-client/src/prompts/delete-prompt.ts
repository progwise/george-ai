import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const deletePrompt = async (id: string) => {
  await strapiClient.request(
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
}
