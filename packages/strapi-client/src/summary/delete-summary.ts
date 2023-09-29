import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const deleteSummary = async (id: string) => {
  try {
    await strapiClient.request(
      graphql(`
        mutation DeleteWebPageSummary($id: ID!) {
          deleteWebPageSummary(id: $id) {
            data {
              id
            }
          }
        }
      `),
      { id },
    )
    console.log(`Summary ${id} successfully deleted.`)
  } catch (error) {
    console.error('Error while deleting Summary:', error)
    throw error
  }
}
