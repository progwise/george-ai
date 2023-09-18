'use client'

import { graphql } from '@/src/gql'
import { getClient } from '@/app/client/urql-client'
import { SummaryFeedbackVoting } from '@/src/gql/graphql'
import Image from 'next/image'
import { useState } from 'react'

interface FeedbackButtonsProps {
  query?: string
  position: number
  webPageSummaryId: string
}

export const FeedbackButtons = ({
  query,
  position,
  webPageSummaryId,
}: FeedbackButtonsProps) => {
  const [feedbackSelection, setFeedbackSelection] = useState<
    SummaryFeedbackVoting | undefined
  >()

  const handleFeedbackChange = async (votingChoice?: SummaryFeedbackVoting) => {
    const feedback =
      feedbackSelection === votingChoice ? undefined : votingChoice
    setFeedbackSelection(feedback)

    if (!feedback) {
      return
    }
    try {
      await getClient().mutation(
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
              id
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
    } catch (error) {
      console.error('Error while creating summary feedback:', error)
    }
  }

  return (
    <div className="flex min-w-max gap-4">
      <button onClick={() => handleFeedbackChange(SummaryFeedbackVoting.Up)}>
        <Image
          src="/thumbs-up.svg"
          alt={SummaryFeedbackVoting.Up}
          className={
            feedbackSelection === SummaryFeedbackVoting.Up
              ? 'opacity-100'
              : 'opacity-25'
          }
          width={24}
          height={24}
        />
      </button>

      <button onClick={() => handleFeedbackChange(SummaryFeedbackVoting.Down)}>
        <Image
          src="/thumbs-down.svg"
          alt={SummaryFeedbackVoting.Down}
          className={
            feedbackSelection === SummaryFeedbackVoting.Down
              ? 'opacity-100'
              : 'opacity-25'
          }
          width={24}
          height={24}
        />
      </button>
    </div>
  )
}
