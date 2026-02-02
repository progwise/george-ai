import { useMemo, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { ExtractionMethod } from '@george-ai/app-commons'

import { graphql } from '../../../gql'
import { AiLibraryFile_ExtractionSelectorFragment } from '../../../gql/graphql'

graphql(`
  fragment AiLibraryFile_ExtractionSelector on AiLibraryFile {
    id
    libraryId
    extractions {
      extractionHash
      sourceHash
      extractionMethod
      extractionDate
      extractedBytes
      physicalBytes
      hasFragments
      fragmentCount
      attachments {
        size
        filename
        mimeType
      }
    }
  }
`)

interface ExtractionSelectorProps {
  file: AiLibraryFile_ExtractionSelectorFragment
  onChange: (extractionMethod: ExtractionMethod) => void
  selectedExtractionMethod?: ExtractionMethod | null
}

export const ExtractionSelector = ({ file, onChange, selectedExtractionMethod }: ExtractionSelectorProps) => {
  const detailsRef = useRef<HTMLDetailsElement>(null)

  const handleChange = (extractionMethod: ExtractionMethod) => {
    detailsRef.current?.removeAttribute('open')
    onChange(extractionMethod)
  }

  const selectedExtraction = useMemo(() => {
    return file.extractions.find((e) => e.extractionMethod === selectedExtractionMethod)
  }, [file.extractions, selectedExtractionMethod])

  if (file.extractions.length === 0) {
    return <div className="text-sm text-base-content/60">No extractions available</div>
  }

  if (file.extractions.length === 1) {
    // Only one extraction, no need for a selector
    return (
      <div className="text-sm text-base-content/80">
        {file.extractions[0].extractionMethod}
        {file.extractions[0].hasFragments && (
          <span className="ml-2 text-base-content/60">
            ({file.extractions[0].fragmentCount?.toLocaleString() || 0} parts)
          </span>
        )}
      </div>
    )
  }

  return (
    <ul className="menu menu-horizontal z-49 items-center menu-xs rounded-full border border-base-content/20 py-0">
      <li>
        <details ref={detailsRef}>
          <summary>{selectedExtraction?.extractionMethod || 'Select extraction'}</summary>
          <ul style={{ marginTop: '0.125rem' }}>
            {file.extractions.map((extraction) => (
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
                  {extraction.hasFragments && (
                    <span className="text-xs text-base-content/60">
                      {extraction.fragmentCount?.toLocaleString() || 0} fragments
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </details>
      </li>
    </ul>
  )
}
