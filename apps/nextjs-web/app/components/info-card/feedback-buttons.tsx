'use client'

import { Enum_Feedback } from '@/src/gql/graphql'
import Image from 'next/image'
import { useState } from 'react'

// type Feedback = Enum_Feedback

export const FeedbackButtons = ({
  feedback,
}: {
  feedback?: Enum_Feedback | null
}) => {
  const [feedbackChoice, setFeedbackChoice] = useState<
    Enum_Feedback | undefined | null
  >(feedback)

  return (
    <div className="flex gap-4">
      <button
        onClick={() =>
          setFeedbackChoice((previousChoice) =>
            previousChoice === Enum_Feedback.Up ? undefined : Enum_Feedback.Up,
          )
        }
      >
        <Image
          src="/thumbs-up.svg"
          alt="Thumbs Up"
          className={
            feedbackChoice === Enum_Feedback.Up ? 'opacity-100' : 'opacity-25'
          }
          width={24}
          height={24}
        />
      </button>
      <button
        onClick={() =>
          setFeedbackChoice((previousChoice) =>
            previousChoice === Enum_Feedback.Down
              ? undefined
              : Enum_Feedback.Down,
          )
        }
      >
        <Image
          src="/thumbs-down-outline.svg"
          alt="Thumbs Down outline"
          className={
            feedbackChoice === Enum_Feedback.Down ? 'opacity-100' : 'opacity-25'
          }
          width={24}
          height={24}
        />
      </button>
    </div>
  )
}
