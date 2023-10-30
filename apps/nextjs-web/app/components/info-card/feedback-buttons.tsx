'use client'

import { graphql } from '@/src/gql'
import { SummaryFeedbackVoting } from '@/src/gql/graphql'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useMutation } from 'urql'

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
        <svg
          className="fill-current group-hover:scale-125"
          width="24"
          height="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M23 10C23 9.46957 22.7893 8.96086 22.4142 8.58579C22.0391 8.21071 21.5304 8 21 8H14.68L15.64 3.43C15.66 3.33 15.67 3.22 15.67 3.11C15.67 2.7 15.5 2.32 15.23 2.05L14.17 1L7.59 7.58C7.22 7.95 7 8.45 7 9V19C7 19.5304 7.21071 20.0391 7.58579 20.4142C7.96086 20.7893 8.46957 21 9 21H18C18.83 21 19.54 20.5 19.84 19.78L22.86 12.73C22.95 12.5 23 12.26 23 12V10ZM1 21H5V9H1V21Z" />
        </svg>
      </button>

      <button
        className={`btn btn-accent btn-sm border-none group ${
          feedbackSelection === SummaryFeedbackVoting.Down
            ? 'btn-active'
            : 'btn-outline'
        }`}
        onClick={() => handleFeedbackChange(SummaryFeedbackVoting.Down)}
      >
        <svg
          className="fill-current group-hover:scale-125"
          width="24"
          height="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19 15V3H23V15H19ZM15 3C15.5304 3 16.0391 3.21071 16.4142 3.58579C16.7893 3.96086 17 4.46957 17 5V15C17 15.55 16.78 16.05 16.41 16.41L9.83 23L8.77 21.94C8.5 21.67 8.33 21.3 8.33 20.88L8.36 20.57L9.31 16H3C2.46957 16 1.96086 15.7893 1.58579 15.4142C1.21071 15.0391 1 14.5304 1 14V12C1 11.74 1.05 11.5 1.14 11.27L4.16 4.22C4.46 3.5 5.17 3 6 3H15ZM15 5H5.97L3 12V14H11.78L10.65 19.32L15 14.97V5Z" />
        </svg>
      </button>
    </div>
  )
}
