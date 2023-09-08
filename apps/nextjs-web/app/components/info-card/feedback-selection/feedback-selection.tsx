import { graphql } from '@/src/gql'
import { FeedbackButtons } from './feedback-buttons'
import { getClient } from '@/app/client/strapi-client'
import { SummaryFeedbackVoting } from '@/src/gql/graphql'

interface FeedbackSelectionProps {
  query?: string
  position: number
  webPageSummaryId: string
}

export const FeedbackSelection = ({
  query,
  position,
  webPageSummaryId,
}: FeedbackSelectionProps) => {
  const handleFeedbackChange = async (feedback?: SummaryFeedbackVoting) => {
    'use server'
    try {
      if (feedback) {
        const response = await getClient().mutation(
          graphql(`
            mutation CreateSummaryFeedback(
              $position: Int!
              $voting: SummaryFeedbackVoting!
              $webPageSummaryId: String!
              $query: String!
            ) {
              createSummaryFeedbackMutation(
                data: {
                  position: $position
                  voting: $voting
                  webPageSummaryId: $webPageSummaryId
                  query: $query
                }
              ) {
                feedbackDate
                id
                position
                query
                voting
                webPageSummaryId
              }
            }
          `),
          {
            query: query ?? '',
            voting: feedback,
            position,
            webPageSummaryId,
          },
        )
        console.log('Mutation successful:', response.data)
      }
    } catch (error) {
      console.error('Error while executing the mutation:', error)
    }
  }

  return <FeedbackButtons onFeedbackChange={handleFeedbackChange} />
}
