import { useMemo, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { graphql } from '../../../gql'
import { AiLibraryFile_MarkdownFileSelectorFragment } from '../../../gql/graphql'
import { useFileActions } from './use-file-actions'

graphql(`
  fragment AiLibraryFile_MarkdownFileSelector on AiLibraryFile {
    id
    libraryId
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
  const confirmDropOutdatedFilesDialog = useRef<HTMLDialogElement>(null)

  const { dropOutdatedMarkdownFiles, fileActionPending } = useFileActions({
    fileId: file.id,
    libraryId: file.libraryId,
  })

  const handleChange = (fileName: string | null) => {
    detailsRef.current?.removeAttribute('open')
    onChange(fileName)
  }

  const handleDropOutdated = async () => {
    if (!confirmDropOutdatedFilesDialog.current) return
    confirmDropOutdatedFilesDialog.current.showModal()
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
    <>
      <dialog ref={confirmDropOutdatedFilesDialog} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Clear Markdown Data</h3>
          <p className="py-4">
            You are about to delete all outdated markdown files from the server. This action cannot be undone. Are you
            sure?
          </p>
          <div className="modal-action gap-2">
            <form method="dialog">
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => confirmDropOutdatedFilesDialog.current?.close()}
              >
                Cancel
              </button>
            </form>
            <button
              type="button"
              className="btn btn-error btn-sm"
              onClick={() => {
                dropOutdatedMarkdownFiles()
                confirmDropOutdatedFilesDialog.current?.close()
              }}
            >
              Delete Outdated Files
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit">close</button>
        </form>
      </dialog>

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
              {oldFiles.length > 0 && (
                <li>
                  <button
                    type="button"
                    className="btn btn-xs"
                    onClick={handleDropOutdated}
                    disabled={fileActionPending}
                  >
                    Clear outdated files...
                  </button>
                </li>
              )}
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
    </>
  )
}
