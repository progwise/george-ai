import { graphql } from '@/src/gql'
import { FeedbackButtons } from './feedback-buttons'
import { getClient } from '@/app/page-list'
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
            mutation createSummaryFeedbackMutation(
              $voting: SummaryFeedbackVoting!
              $webPageSummaryId: String!
              $position: Int!
              $query: String!
            ) {
              createSummaryFeedback(
                data: {
                  voting: $voting
                  webPageSummaryId: $webPageSummaryId
                  position: $position
                  query: $query
                }
              ) {
                voting
                webPageSummaryId
                position
                query
                feedbackDate
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
