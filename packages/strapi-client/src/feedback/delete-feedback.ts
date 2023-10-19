import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const deleteFeedback = async (id: string) => {
  await strapiClient.request(
    graphql(`
      mutation DeleteSummaryFeedback($id: ID!) {
        deleteSummaryFeedback(id: $id) {
          data {
            id
          }
        }
      }
    `),
    { id },
  )
  console.log(`Feedback ${id} successfully deleted.`)
}
