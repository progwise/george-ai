'use client'

import { graphql } from '@/src/gql'
import { SummaryFeedbackVoting } from '@/src/gql/graphql'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useMutation } from 'urql'
import { ThumbsUpSvg } from '@/public/thumbs-up-svg'
import { ThumbsDownSvg } from '@/public/thumbs-down-svg'

interface FeedbackButtonsProps {
  infoCardIndex: number
  summaryId: string
}

export const FeedbackButtons = ({
  infoCardIndex,
  summaryId,
}: FeedbackButtonsProps) => {
  const searchParameters = useSearchParams()
  const query = searchParameters.get('query')
  const [feedbackSelection, setFeedbackSelection] = useState<
    SummaryFeedbackVoting | undefined
  >()
  const [, createSummaryFeedback] = useMutation(
    graphql(`
      mutation CreateSummaryFeedback(
        $infoCardIndex: Int!
        $voting: SummaryFeedbackVoting!
        $summaryId: String!
        $query: String!
      ) {
        createSummaryFeedback(
          data: {
            selectedSummaryIndex: $infoCardIndex
            voting: $voting
            webPageSummaryId: $summaryId
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
        infoCardIndex,
        summaryId,
      })
    } catch (error) {
      console.error('Error while creating summary feedback:', error)
    }
  }

  return (
    <div className="flex min-w-max gap-0.5 z-10">
      <button
        className={`btn btn-accent btn-sm border-none group ${
          feedbackSelection === SummaryFeedbackVoting.Up
            ? 'btn-active'
            : 'btn-outline'
        }`}
        onClick={() => handleFeedbackChange(SummaryFeedbackVoting.Up)}
      >
        <ThumbsUpSvg />
      </button>

      <button
        className={`btn btn-accent btn-sm border-none group ${
          feedbackSelection === SummaryFeedbackVoting.Down
            ? 'btn-active'
            : 'btn-outline'
        }`}
        onClick={() => handleFeedbackChange(SummaryFeedbackVoting.Down)}
      >
        <ThumbsDownSvg />
      </button>
    </div>
  )
}
