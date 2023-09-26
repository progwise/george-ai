import { graphql } from './gql/gql.js'
import {
  CreateSummaryFeedbackMutation,
  Enum_Summaryfeedback_Voting,
} from './gql/graphql.js'
import { strapiClient } from './strapi.js'

export const createSummaryFeedback = async (
  position: number,
  query: string,
  voting: Enum_Summaryfeedback_Voting,
  webPageSummaryId: string,
) => {
  console.log('PARAMETER:', position, query, voting, webPageSummaryId)
  try {
    const { createSummaryFeedback: createSummaryFeedbackResult } =
      await strapiClient.request<CreateSummaryFeedbackMutation>(
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
      createSummaryFeedbackResult?.data?.id,
    )
    return createSummaryFeedbackResult?.data
  } catch (error) {
    console.error('Error creating summary feedback:', error)
    throw error
  }
}
