'use client'

import { graphql } from '@/src/gql'
import { getClient } from '@/app/client/urql-client'
import { SummaryFeedbackVoting } from '@/src/gql/graphql'
import Image from 'next/image'
import { useState } from 'react'

interface FeedbackSelectionProps {
  query?: string
  position: number
  webPageSummaryId: string
}

export const FeedbackButtons = ({
  query,
  position,
  webPageSummaryId,
}: FeedbackSelectionProps) => {
  const [feedbackSelection, setFeedbackSelection] = useState<
    SummaryFeedbackVoting | undefined
  >()

  const onFeedbackChange = async (votingChoice?: SummaryFeedbackVoting) => {
    const feedback =
      feedbackSelection === votingChoice ? undefined : votingChoice
    setFeedbackSelection(feedback)

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

  return (
    <div className="flex gap-4">
      {Object.values(SummaryFeedbackVoting)
        .reverse()
        .map((votingChoice) => (
          <button
            key={votingChoice}
            onClick={() => onFeedbackChange(votingChoice)}
          >
            <Image
              src={`/thumbs-${votingChoice}.svg`}
              alt={votingChoice}
              className={
                feedbackSelection === votingChoice
                  ? 'opacity-100'
                  : 'opacity-25'
              }
              width={24}
              height={24}
            />
          </button>
        ))}
    </div>
  )
}
