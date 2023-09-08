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
    let summaryFeedbackId: string | undefined
    try {
      try {
        const summaryFeedbacks = await getClient().query(
          graphql(`
            query SummaryFeedbacksById($webPageSummaryId: String!) {
              summaryFeedbacksById(
                data: { webPageSummaryId: $webPageSummaryId }
              ) {
                id
              }
            }
          `),
          {
            webPageSummaryId,
          },
        )

        summaryFeedbackId =
          summaryFeedbacks.data?.summaryFeedbacksById.at(0)?.id
      } catch (error) {
        console.error('Error while fetching summary feedbacks:', error)
        return
      }

      console.log(
        'Search by id:',
        webPageSummaryId,
        'SummaryFeedbackId:',
        summaryFeedbackId,
      )

      if (!feedback && summaryFeedbackId) {
        try {
          const deleteResponse = await getClient().mutation(
            graphql(`
              mutation deleteSummaryFeedbackMutation(
                $summaryFeedbackId: String!
              ) {
                deleteSummaryFeedbackMutation(
                  data: { summaryFeedbackId: $summaryFeedbackId }
                ) {
                  id
                }
              }
            `),
            {
              summaryFeedbackId,
            },
          )
          // console.log('Delete successful:', deleteResponse.data)
        } catch (error) {
          console.error('Error while deleting summary feedback:', error)
        }
        return
      }

      if (feedback && summaryFeedbackId) {
        try {
          const updateResponse = await getClient().mutation(
            graphql(`
              mutation updateSummaryFeedbackMutation(
                $summaryFeedbackId: String!
                $position: Int!
                $voting: SummaryFeedbackVoting!
                $webPageSummaryId: String!
                $query: String!
              ) {
                updateSummaryFeedbackMutation(
                  data: {
                    summaryFeedbackId: $summaryFeedbackId
                    position: $position
                    voting: $voting
                    webPageSummaryId: $webPageSummaryId
                    query: $query
                  }
                ) {
                  feedbackDate
                  id
                  position
                  voting
                  webPageSummaryId
                  query
                }
              }
            `),
            {
              summaryFeedbackId,
              query: query ?? '',
              voting: feedback,
              position,
              webPageSummaryId,
            },
          )
          // console.log('Update successful:', updateResponse.data)
        } catch (error) {
          console.error('Error while updating summary feedback:', error)
        }
        return
      }

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
          // console.log('Create successful:', createResponse.data)
        } catch (error) {
          console.error('Error while creating summary feedback:', error)
        }
      }
    } catch (error) {
      console.error('Error while executing the overall mutation flow:', error)
    }
  }

  return <FeedbackButtons onFeedbackChange={handleFeedbackChange} />
}
