'use client'

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
          <svg
            className={`fill-current ${
              isExpand ? 'group-hover:scale-y-75' : 'group-hover:scale-y-125'
            }`}
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isExpand ? (
              <path d="M4 12.0131H20V14.0131H4V12.0131ZM4 9.01306H20V11.0131H4V9.01306ZM16 4.01306L12 8.01306L8 4.01306H11V1.01306H13V4.01306H16ZM8 19.0131L12 15.0131L16 19.0131H13V22.0131H11V19.0131H8Z" />
            ) : (
              <path d="M4 22.0131V20.0131H20V22.0131H4ZM12 19.0131L8 15.0131L9.4 13.6131L11 15.1631V8.86309L9.4 10.4131L8 9.01309L12 5.01309L16 9.01309L14.6 10.4131L13 8.86309V15.1631L14.6 13.6131L16 15.0131L12 19.0131ZM4 4.01309V2.01309H20V4.01309H4Z" />
            )}
          </svg>
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
                <svg
                  className={`fill-current ${
                    isExpand
                      ? 'group-hover:scale-y-75'
                      : 'group-hover:scale-y-125'
                  }`}
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 12.0131H20V14.0131H4V12.0131ZM4 9.01306H20V11.0131H4V9.01306ZM16 4.01306L12 8.01306L8 4.01306H11V1.01306H13V4.01306H16ZM8 19.0131L12 15.0131L16 19.0131H13V22.0131H11V19.0131H8Z" />
                </svg>
              </button>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
