import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { DocumentFile } from '../../gql/graphql'
import { DownloadIcon } from '../../icons/download-icon'
import { FileIcon } from '../../icons/file-icon'
import { FormattedMarkdown } from '../formatted-markdown'
import { getFileDownloadUrlQueryOptions } from './queries'

export const DocumentFileViewerDialog = ({ file, onClose }: { file: DocumentFile; onClose: () => void }) => {
  const [contentType, setContentType] = useState<string | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [markdownSource, setMarkdownSource] = useState(false)
  const [markdownContent, setMarkdownContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { data: downloadUrl } = useQuery(getFileDownloadUrlQueryOptions({ file }))

  useEffect(() => {
    if (!downloadUrl) return

    let localBlobUrl: string | null = null

    const abortController = new AbortController()

    const fetchFile = async () => {
      try {
        const response = await fetch(downloadUrl, {
          method: 'GET',
          credentials: 'include',
          signal: abortController.signal,
        })
        if (!response.ok) {
          setError(`Failed to fetch file ${downloadUrl}, status: ${response.status}`)
          return
        }
        const myContentType = response.headers.get('Content-Type') || 'application/octet-stream'
        setContentType(myContentType)

        const blob = await response.blob()
        localBlobUrl = URL.createObjectURL(blob)
        if (myContentType.includes('markdown')) {
          const textContent = await blob.text()
          setMarkdownContent(textContent)
        } else {
          setMarkdownContent(null)
        }
        setBlobUrl(localBlobUrl)
      } catch (error) {
        if (error.name === 'AbortError') {
          return
        }
        setError(`Error fetching file metadata for ${downloadUrl}: ${error}`)
      }
    }
    fetchFile()

    return () => {
      abortController.abort()
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl)
      }
    }
  }, [downloadUrl])

  return (
    <dialog open className="modal">
      <form method="dialog" className="modal-box w-full max-w-5xl">
        <button type="button" onClick={onClose} className="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm">
          ✕
        </button>
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold">
            <FileIcon className="mr-2 inline size-5" mimeType={contentType} />
            {file.fileName}
          </h3>
          {error && <div className="rounded-sm bg-red-100 p-2 text-sm text-red-700">{error}</div>}
          <div className="flex justify-between gap-2 text-sm text-gray-500">
            <div>Modified: {file.modified}</div>
            <div></div>
            <div>
              {file.mimeType?.includes('markdown') && (
                <label className="label">
                  {markdownSource ? 'raw' : 'rendered'}
                  <input
                    type="checkbox"
                    defaultChecked
                    className="toggle mr-2 toggle-sm"
                    onChange={() => setMarkdownSource((prev) => !prev)}
                  />
                </label>
              )}
              <span>Content Type: {contentType}</span>
              <button
                type="button"
                className="ml-4"
                title="Copy source"
                onClick={() => {
                  if (!markdownContent) return
                  navigator.clipboard.writeText(markdownContent).then(() => {
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  })
                }}
              >
                {copied ? (
                  <svg
                    className="inline size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg
                    className="inline size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="ml-4 underline">
                <DownloadIcon className="inline size-4" />
              </a>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-auto rounded-sm border p-4">
            {file.mimeType?.startsWith('image/') ? (
              <img src={downloadUrl} alt={file.fileName} className="max-h-[70vh] object-contain" />
            ) : file.mimeType?.includes('markdown') && !markdownSource ? (
              <FormattedMarkdown markdown={markdownContent ? markdownContent : `![${file.fileName}](${downloadUrl})`} />
            ) : (
              <object
                data={blobUrl || undefined}
                title={file.fileName}
                className="h-[70vh] w-full"
                type={contentType || undefined}
              />
            )}
          </div>
        </div>
      </form>
    </dialog>
  )
}
