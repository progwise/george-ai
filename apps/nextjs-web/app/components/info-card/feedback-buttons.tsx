'use client'

import { graphql } from '@/src/gql'
import { getClient } from '@/app/client/urql-client'
import { SummaryFeedbackVoting } from '@/src/gql/graphql'
import Image from 'next/image'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useMutation } from 'urql'

interface FeedbackButtonsProps {
  position: number
  webPageSummaryId: string
}

export const FeedbackButtons = ({
  position,
  webPageSummaryId,
}: FeedbackButtonsProps) => {
  const searchParameters = useSearchParams()
  const query = searchParameters.get('query')
  const [feedbackSelection, setFeedbackSelection] = useState<
    SummaryFeedbackVoting | undefined
  >()
  const [, createSummaryFeedback] = useMutation(
    graphql(`
      mutation CreateSummaryFeedback(
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
  )
  const handleFeedbackChange = async (votingChoice?: SummaryFeedbackVoting) => {
    const feedback =
      feedbackSelection === votingChoice ? undefined : votingChoice
    setFeedbackSelection(feedback)

    if (!feedback) {
      return
    }
    try {
      await createSummaryFeedback({
        query: query ?? '',
        voting: feedback,
        position,
        webPageSummaryId,
      })
    } catch (error) {
      console.error('Error while creating summary feedback:', error)
    }
  }

  return (
    <div className="flex min-w-max gap-4 z-10">
      <button onClick={() => handleFeedbackChange(SummaryFeedbackVoting.Up)}>
        <Image
          src="/thumbs-up.svg"
          alt={SummaryFeedbackVoting.Up}
          className={`hover:scale-125
          ${
            feedbackSelection === SummaryFeedbackVoting.Up
              ? 'opacity-100'
              : 'opacity-25'
          }
          `}
          width={24}
          height={24}
        />
      </button>

      <button onClick={() => handleFeedbackChange(SummaryFeedbackVoting.Down)}>
        <Image
          src="/thumbs-down.svg"
          alt={SummaryFeedbackVoting.Down}
          className={`hover:scale-125
          ${
            feedbackSelection === SummaryFeedbackVoting.Down
              ? 'opacity-100'
              : 'opacity-25'
          }
          `}
          width={24}
          height={24}
        />
      </button>
    </div>
  )
}
