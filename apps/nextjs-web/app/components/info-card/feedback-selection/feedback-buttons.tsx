'use client'

import { SummaryFeedbackVoting } from '@/src/gql/graphql'
import Image from 'next/image'
import { useState } from 'react'

interface FeedbackButtonsProps {
  onFeedbackChange: (feedback?: SummaryFeedbackVoting) => void
}

export const FeedbackButtons = ({ onFeedbackChange }: FeedbackButtonsProps) => {
  const [feedbackChoice, setFeedbackChoice] = useState<
    SummaryFeedbackVoting | undefined
  >()

  return (
    <div className="flex gap-4">
      <button
        onClick={() => {
          const vote =
            feedbackChoice === SummaryFeedbackVoting.Up
              ? undefined
              : SummaryFeedbackVoting.Up
          setFeedbackChoice(vote)
          onFeedbackChange(vote)
        }}
      >
        <Image
          src="/thumbs-up.svg"
          alt="Thumbs Up"
          className={
            feedbackChoice === SummaryFeedbackVoting.Up
              ? 'opacity-100'
              : 'opacity-25'
          }
          width={24}
          height={24}
        />
      </button>
      <button
        onClick={() => {
          const vote =
            feedbackChoice === SummaryFeedbackVoting.Down
              ? undefined
              : SummaryFeedbackVoting.Down
          setFeedbackChoice(vote)
          onFeedbackChange(vote)
        }}
      >
        <Image
          src="/thumbs-down-outline.svg"
          alt="Thumbs Down outline"
          className={
            feedbackChoice === SummaryFeedbackVoting.Down
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
