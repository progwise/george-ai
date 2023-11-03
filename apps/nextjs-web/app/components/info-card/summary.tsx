'use client'

import { CollapseSymbolsSvg } from '@/public/collapse-symbols-svg'
import { ExpandSymbolsSvg } from '@/public/expand-symbols-svg'
import { useRef, useState } from 'react'
import xss from 'xss'

export const Summary = ({
  summary,
  summaryId,
}: {
  summary: string
  summaryId: string
}) => {
  const [isExpand, setIsExpand] = useState(false)
  const summaryReference = useRef<HTMLDivElement | null>(null)
  const cleanHtml = xss(summary)
  const svgClassName =
    'group-hover:text-white transition-transform duration-200'

  return (
    <div className="flex gap-2">
      <div>
        <div
          className={`prose prose-sm ${isExpand ? '' : 'line-clamp-3'}`}
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
      </div>
      <div className="flex flex-col justify-between">
        <button
          className="btn btn-outline btn-accent btn-sm group"
          onClick={() => setIsExpand(!isExpand)}
        >
          {isExpand ? (
            <CollapseSymbolsSvg className={svgClassName} isExpand={isExpand} />
          ) : (
            <ExpandSymbolsSvg className={svgClassName} isExpand={isExpand} />
          )}
        </button>
        {isExpand && (
          <div className="flex justify-end">
            <a href={`#infoCard_${summaryId}`}>
              <button
                className="btn btn-outline btn-accent btn-sm group"
                onClick={() => {
                  setIsExpand(false)
                }}
              >
                <CollapseSymbolsSvg
                  className={svgClassName}
                  isExpand={isExpand}
                />
              </button>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
