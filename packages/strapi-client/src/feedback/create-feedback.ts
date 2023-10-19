import { graphql } from '../gql/gql'
import { Enum_Summaryfeedback_Voting } from '../gql/graphql'
import { strapiClient } from '../strapi-client'

export const createFeedback = async (
  selectedSummaryIndex: number,
  query: string,
  voting: 'down' | 'up',
  webPageSummaryId: string,
): Promise<string> => {
  try {
    const { createSummaryFeedback } = await strapiClient.request(
      graphql(`
        mutation CreateSummaryFeedback($input: SummaryFeedbackInput!) {
          createSummaryFeedback(data: $input) {
            data {
              id
              attributes {
                selectedSummaryIndex
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
          selectedSummaryIndex,
          query,
          voting:
            voting === 'up'
              ? Enum_Summaryfeedback_Voting.Up
              : Enum_Summaryfeedback_Voting.Down,
          web_page_summary: webPageSummaryId,
        },
      },
    )
    console.log(
      'create SummaryFeedback by id:',
      createSummaryFeedback?.data?.id,
    )
    return createSummaryFeedback?.data?.id ?? ''
  } catch (error) {
    console.error('Error while creating SummaryFeedback:', error)
    throw error
  }
}
