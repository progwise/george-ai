import { strapiClient } from '..'
import { graphql } from '../gql'

export const deleteFeedback = async (id: string) => {
  try {
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
  } catch (error) {
    console.error('Error while deleting Feedback:', error)
    throw error
  }
}
