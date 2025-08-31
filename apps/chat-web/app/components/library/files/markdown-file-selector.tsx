import { useSearch } from '@tanstack/react-router'
import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { graphql } from '../../../gql'
import { AiLibraryFile_MarkdownFileSelectorFragment } from '../../../gql/graphql'
import { Pagination } from '../../table/pagination'

graphql(`
  fragment AiLibraryFile_MarkdownFileSelector on AiLibraryFile {
    latesExtractionMarkdownFileName
    availableExtractionMarkdowns {
      fileNames
      totalCount
      take
      skip
    }
  }
`)

interface MarkdownFileSelectorProps {
  file: AiLibraryFile_MarkdownFileSelectorFragment
  onChange: (fileName: string | null) => void
}

export const MarkdownFileSelector = ({ file, onChange }: MarkdownFileSelectorProps) => {
  const params = useSearch({ strict: false })

  const detailsRef = useRef<HTMLDetailsElement>(null)

  const handleChange = (fileName: string | null) => {
    detailsRef.current?.removeAttribute('open')
    onChange(fileName)
  }
  return (
    <ul className="menu menu-horizontal bg-base-200 rounded-box menu-sm z-50 items-center shadow-lg">
      <li>
        <details ref={detailsRef}>
          <summary>Switch Extraction Markdown File</summary>

          <ul className="right-0 w-fit">
            <li className="flex items-end">
              <Pagination
                totalItems={file.availableExtractionMarkdowns.fileNames.length}
                itemsPerPage={file.availableExtractionMarkdowns.take || 20}
                currentPage={
                  file.availableExtractionMarkdowns.skip || 0 / (file.availableExtractionMarkdowns.take || 20) + 1 || 1
                }
                onPageChange={function (page: number): void {
                  console.log('Function not implemented.', page)
                }}
              />
            </li>
            {file.availableExtractionMarkdowns.fileNames.map((fileName) => (
              <li key={`${fileName}`}>
                <button
                  type="button"
                  className={twMerge(params.markdownFileName === fileName && 'underline')}
                  onClick={() => handleChange(fileName)}
                >
                  <span className="text-nowrap">{fileName || 'no-name'}</span>
                </button>
              </li>
            ))}
          </ul>
        </details>
      </li>
    </ul>
  )
}
