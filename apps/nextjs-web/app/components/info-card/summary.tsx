'use client'

import Image from 'next/image'
import { useState } from 'react'
import styles from './summary.module.css'
import xss from 'xss'

export const Summary = ({ summary }: { summary: string }) => {
  const [isExpand, setIsExpand] = useState(false)
  const cleanHtml = xss(summary)

  return (
    <div className="flex items-start gap-2">
      <div
        className={`${styles.summary} ${isExpand ? '' : 'line-clamp-3'}`}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
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
