'use client'

import { graphql } from '@/src/gql'
import { FeedbackButtons } from './feedback-buttons'
import { getClient } from '@/app/client/urql-client'
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
    if (feedback) {
      try {
        const createResponse = await getClient().mutation(
          graphql(`
            mutation createSummaryFeedback(
              $position: Int!
              $voting: SummaryFeedbackVoting!
              $webPageSummaryId: String!
              $query: String!
            ) {
              createSummaryFeedback(
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
        console.log('Create successful:', createResponse.data)
      } catch (error) {
        console.error('Error while creating summary feedback:', error)
      }
    }
  }

  return <FeedbackButtons onFeedbackChange={handleFeedbackChange} />
}
