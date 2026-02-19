import { useMemo, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { ExtractionMethod } from '../../../gql/graphql'
import { ClientDate } from '../../client-date'

interface ExtractionSelectorProps {
  extractions: Array<{
    extractionMethod: ExtractionMethod
    souceHash?: string | null
    created: string
    updated?: string | null
  }>
  onChange: (extractionMethod: ExtractionMethod) => void
  selectedExtractionMethod?: ExtractionMethod
}

export const ExtractionSelector = ({ extractions, onChange, selectedExtractionMethod }: ExtractionSelectorProps) => {
  const detailsRef = useRef<HTMLDetailsElement>(null)

  const handleChange = (extractionMethod: ExtractionMethod) => {
    detailsRef.current?.removeAttribute('open')
    onChange(extractionMethod)
  }

  const selectedExtraction = useMemo(() => {
    return extractions.find((e) => e.extractionMethod === selectedExtractionMethod)
  }, [extractions, selectedExtractionMethod])

  if (extractions.length === 0) {
    return <div className="text-sm text-base-content/60">No extractions available</div>
  }

  if (extractions.length === 1) {
    // Only one extraction, no need for a selector
    return <div className="text-sm text-base-content/80">{extractions[0].extractionMethod}</div>
  }

  return (
    <ul className="menu menu-horizontal z-49 items-center menu-xs rounded-full border border-base-content/20 py-0">
      <li>
        <details ref={detailsRef}>
          <summary>{selectedExtraction?.extractionMethod || 'Select extraction'}</summary>
          <ul style={{ marginTop: '0.125rem' }}>
            {extractions.map((extraction) => (
              <li key={`${extraction.extractionMethod} || 'default'}`}>
                <button
                  type="button"
                  className={twMerge(
                    'flex flex-col items-start',
                    selectedExtractionMethod === extraction.extractionMethod && 'btn-active',
                  )}
                  onClick={() => handleChange(extraction.extractionMethod)}
                >
                  <span className="font-medium text-nowrap">{extraction.extractionMethod}</span>
                  <span className="text-xs text-base-content/60">
                    <ClientDate date={extraction.updated || extraction.created} format="dateTime" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </details>
      </li>
    </ul>
  )
}
