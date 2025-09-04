import { useMemo, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { graphql } from '../../../gql'
import { AiLibraryFile_MarkdownFileSelectorFragment } from '../../../gql/graphql'

graphql(`
  fragment AiLibraryFile_MarkdownFileSelector on AiLibraryFile {
    latestExtractionMarkdownFileNames
    availableExtractionMarkdownFileNames
  }
`)

interface MarkdownFileSelectorProps {
  file: AiLibraryFile_MarkdownFileSelectorFragment
  onChange: (fileName: string | null) => void
  selectedFileName?: string
}

export const MarkdownFileSelector = ({ file, onChange, selectedFileName }: MarkdownFileSelectorProps) => {
  const detailsRef = useRef<HTMLDetailsElement>(null)

  const handleChange = (fileName: string | null) => {
    detailsRef.current?.removeAttribute('open')
    onChange(fileName)
  }

  const activeFiles = useMemo(() => {
    return file.latestExtractionMarkdownFileNames
  }, [file.latestExtractionMarkdownFileNames])
  const oldFiles = useMemo(() => {
    return file.availableExtractionMarkdownFileNames.filter(
      (fileName) => file.latestExtractionMarkdownFileNames.indexOf(fileName) === -1,
    )
  }, [file.availableExtractionMarkdownFileNames, file.latestExtractionMarkdownFileNames])

  return (
    <ul className="menu menu-horizontal menu-xs z-49 border-base-content/20 items-center rounded-full border py-0">
      <li>
        <details ref={detailsRef}>
          <summary>{selectedFileName || 'Select a file'}</summary>
          <ul style={{ marginTop: '0.125rem' }}>
            {activeFiles.map((fileName) => (
              <li key={`active-${fileName}`}>
                <button
                  type="button"
                  className={twMerge('text-primary', selectedFileName === fileName && 'btn-active')}
                  onClick={() => handleChange(fileName)}
                >
                  <span className="text-nowrap">{fileName || 'no-name'}</span>
                </button>
              </li>
            ))}
            <li>
              <button type="button" className="btn btn-xs">
                Clear outdated files...
              </button>
            </li>
            {oldFiles.length < 1 ? (
              <li className="opacity-50">No old files</li>
            ) : (
              oldFiles.map((fileName) => (
                <li key={`all-${fileName}`}>
                  <button
                    type="button"
                    className={twMerge(selectedFileName === fileName && 'btn-active')}
                    onClick={() => handleChange(fileName)}
                  >
                    <span className="text-nowrap">{fileName || 'no-name'}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </details>
      </li>
    </ul>
  )
}
