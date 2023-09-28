'use client'

import Image from 'next/image'
import { useState } from 'react'

export const Summary = ({ summary }: { summary: string }) => {
  const [isExpand, setIsExpand] = useState(false)

  return (
    <div className="flex items-start gap-2">
      <span className={isExpand ? '' : 'line-clamp-3'}>{summary}</span>
      {/* <button onClick={() => setIsExpand(!isExpand)}> */}
      <Image
        src={`/${isExpand ? 'collapse' : 'expand'}-symbols.svg`}
        alt={`${isExpand ? 'collapse' : 'expand'}-symbols`}
        className={`cursor-pointer hover:scale-y-${isExpand ? '75' : '125'}`}
        onClick={() => setIsExpand(!isExpand)}
        width={24}
        height={24}
      />
      {/* </button> */}
    </div>
  )
}
