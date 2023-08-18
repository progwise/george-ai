'use client'

import { Feedback } from '@/src/gql/graphql'
import Image from 'next/image'
import { useState } from 'react'

export const FeedbackButtons = ({ feedback }: { feedback?: Feedback }) => {
  const [feedbackChoice, setFeedbackChoice] = useState<Feedback | undefined>(
    feedback,
  )

  return (
    <div className="flex gap-4">
      <button
        onClick={() =>
          setFeedbackChoice((previousChoice) =>
            previousChoice === Feedback.Up ? undefined : Feedback.Up,
          )
        }
      >
        <Image
          src="/thumbs-up.svg"
          alt="Thumbs Up"
          className={
            feedbackChoice === Feedback.Up ? 'opacity-100' : 'opacity-25'
          }
          width={24}
          height={24}
        />
      </button>
      <button
        onClick={() =>
          setFeedbackChoice((previousChoice) =>
            previousChoice === Feedback.Down ? undefined : Feedback.Down,
          )
        }
      >
        <Image
          src="/thumbs-down-outline.svg"
          alt="Thumbs Down outline"
          className={
            feedbackChoice === Feedback.Down ? 'opacity-100' : 'opacity-25'
          }
          width={24}
          height={24}
        />
      </button>
    </div>
  )
}
