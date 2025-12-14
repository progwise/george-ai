import { useMemo, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { graphql } from '../../../gql'
import { AiLibraryFile_MarkdownFileSelectorFragment } from '../../../gql/graphql'

graphql(`
  fragment AiLibraryFile_MarkdownFileSelector on AiLibraryFile {
    id
    libraryId
    availableExtractions {
      extractionMethod
      extractionMethodParameter
      totalParts
      totalSize
      isBucketed
      mainFileUrl
      displayName
    }
  }
`)

interface MarkdownFileSelectorProps {
  file: AiLibraryFile_MarkdownFileSelectorFragment
  onChange: (url: string | null) => void
  selectedUrl?: string
}

export const MarkdownFileSelector = ({ file, onChange, selectedUrl }: MarkdownFileSelectorProps) => {
  const detailsRef = useRef<HTMLDetailsElement>(null)

  const handleChange = (url: string | null) => {
    detailsRef.current?.removeAttribute('open')
    onChange(url)
  }

  const selectedExtraction = useMemo(() => {
    return file.availableExtractions.find((e) => e.mainFileUrl === selectedUrl)
  }, [file.availableExtractions, selectedUrl])

  if (file.availableExtractions.length === 0) {
    return <div className="text-sm text-base-content/60">No extractions available</div>
  }

  if (file.availableExtractions.length === 1) {
    // Only one extraction, no need for a selector
    return (
      <div className="text-sm text-base-content/80">
        {file.availableExtractions[0].displayName}
        {file.availableExtractions[0].isBucketed && (
          <span className="ml-2 text-base-content/60">
            ({file.availableExtractions[0].totalParts.toLocaleString()} parts)
          </span>
        )}
      </div>
    )
  }

  return (
    <ul className="menu menu-horizontal z-49 items-center menu-xs rounded-full border border-base-content/20 py-0">
      <li>
        <details ref={detailsRef}>
          <summary>{selectedExtraction?.displayName || 'Select extraction'}</summary>
          <ul style={{ marginTop: '0.125rem' }}>
            {file.availableExtractions.map((extraction) => (
              <li key={`${extraction.extractionMethod}-${extraction.extractionMethodParameter || 'default'}`}>
                <button
                  type="button"
                  className={twMerge(
                    'flex flex-col items-start',
                    selectedUrl === extraction.mainFileUrl && 'btn-active',
                  )}
                  onClick={() => handleChange(extraction.mainFileUrl)}
                >
                  <span className="font-medium text-nowrap">{extraction.displayName}</span>
                  {extraction.isBucketed && (
                    <span className="text-xs text-base-content/60">{extraction.totalParts.toLocaleString()} parts</span>
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
