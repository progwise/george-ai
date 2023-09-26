import { graphql } from '../gql/gql'
import {
  CreateSummaryFeedbackMutation,
  Enum_Summaryfeedback_Voting,
} from '../gql/graphql'
import { strapiClient } from '../strapi'

export const createFeedback = async (
  position: number,
  query: string,
  voting: Enum_Summaryfeedback_Voting,
  webPageSummaryId: string,
) => {
  try {
    const { createSummaryFeedback } = await strapiClient.request(
      graphql(`
        mutation CreateSummaryFeedback($input: SummaryFeedbackInput!) {
          createSummaryFeedback(data: $input) {
            data {
              id
              attributes {
                position
                query
                voting
                web_page_summary {
                  data {
                    id
                  }
                }
              }
            }
          }
        }
      `),
      {
        input: {
          position,
          query,
          voting,
          web_page_summary: webPageSummaryId,
        },
      },
    )
    console.log(
      'create SummaryFeedback by id:',
      createSummaryFeedback?.data?.id,
    )
    return createSummaryFeedback?.data
  } catch (error) {
    console.error('Error creating summary feedback:', error)
    throw error
  }
}
