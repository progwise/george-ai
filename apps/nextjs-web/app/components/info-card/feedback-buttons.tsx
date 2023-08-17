'use client'

import Image from 'next/image'
import { useState } from 'react'

type Feedback = 'up' | 'down' | undefined

export const FeedbackButtons = ({ feedback }: { feedback: Feedback }) => {
  const [feedbackChoice, setFeedbackChoice] = useState<Feedback>(feedback)

  return (
    <div className="flex gap-4">
      <button
        onClick={() =>
          setFeedbackChoice((previousChoice) =>
            previousChoice === 'up' ? undefined : 'up',
          )
        }
      >
        <Image
          src="/thumbs-up.svg"
          alt="Thumbs Up"
          className={feedbackChoice === 'up' ? 'opacity-100' : 'opacity-25'}
          width={24}
          height={24}
        />
      </button>
      <button
        onClick={() =>
          setFeedbackChoice((previousChoice) =>
            previousChoice === 'down' ? undefined : 'down',
          )
        }
      >
        <Image
          src="/thumbs-down-outline.svg"
          alt="Thumbs Down outline"
          className={feedbackChoice === 'down' ? 'opacity-100' : 'opacity-25'}
          width={24}
          height={24}
        />
      </button>
    </div>
  )
}
