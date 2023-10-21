'use client'

import Image from 'next/image'
import { useState } from 'react'
import xss from 'xss'

export const Summary = ({ summary }: { summary: string }) => {
  const [isExpand, setIsExpand] = useState(false)
  const cleanHtml = xss(summary)

  return (
    <div className="flex items-start gap-2">
      <div
        className={`prose prose-sm ${isExpand ? '' : 'line-clamp-3'}`}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
      <button
        className={`flex-none cursor-pointer transition-transform ${
          isExpand ? 'hover:scale-y-75' : 'hover:scale-y-125'
        }`}
        onClick={() => setIsExpand(!isExpand)}
      >
        <Image
          src={`/${isExpand ? 'collapse' : 'expand'}-symbols.svg`}
          alt={`${isExpand ? 'collapse' : 'expand'}-symbols`}
          onClick={() => setIsExpand(!isExpand)}
          width={24}
          height={24}
        />
      </button>
    </div>
  )
}
