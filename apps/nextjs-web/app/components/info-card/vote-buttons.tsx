'use client'

import Image from 'next/image'
import { useState } from 'react'

type VoteResult = 'up' | 'down' | undefined

export const VoteButtons = ({ voteResult }: { voteResult: VoteResult }) => {
  const [vote, setVote] = useState<VoteResult>(voteResult)

  return (
    <div className="flex gap-4">
      <Image
        src="/thumbs-up.svg"
        alt="Thumbs Up"
        className={`cursor-pointer ${
          vote === 'up' ? 'opacity-100' : 'opacity-25'
        }`}
        width={24}
        height={24}
        priority
        onClick={() =>
          setVote((previousVote) => (previousVote === 'up' ? undefined : 'up'))
        }
      />
      <Image
        src="/thumbs-down-outline.svg"
        alt="Thumbs Down outline"
        className={`cursor-pointer ${
          vote === 'down' ? 'opacity-100' : 'opacity-25'
        }`}
        width={24}
        height={24}
        priority
        onClick={() =>
          setVote((previousVote) =>
            previousVote === 'down' ? undefined : 'down',
          )
        }
      />
    </div>
  )
}
