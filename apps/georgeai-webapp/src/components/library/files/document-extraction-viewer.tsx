import { useEffect, useMemo, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { ExtractionMethod } from '@george-ai/app-commons'

import { convertExtractionMarkdownToHtml } from './convert-extraction-markdown'
import { useMarkdownDownload } from './use-markdown-download'

interface DocumentExtractionViewerProps {
  libraryId: string
  documentId: string
  extractionMethod: ExtractionMethod
  fragment?: number
  className?: string
  backendPublicUrl: string
  viewMarkdownSource?: boolean
}

export const DocumentExtractionViewer = ({
  libraryId,
  documentId,
  extractionMethod,
  fragment,
  className,
  backendPublicUrl,
  viewMarkdownSource,
}: DocumentExtractionViewerProps) => {
  const ref = useRef<HTMLDivElement>(null)

  // Build URL with part parameter if specified
  const urlToLoad = useMemo(() => {
    const baseUrl = `${backendPublicUrl}/library-files/${libraryId}/${documentId}`
    const url = new URL(baseUrl)
    url.searchParams.set('extraction', extractionMethod)
    if (fragment) {
      url.searchParams.set('fragment', fragment.toString())
    }
    return url.toString()
  }, [backendPublicUrl, libraryId, documentId, extractionMethod, fragment])

  const { markdown, totalBytes, bytesLoaded, progress, error } = useMarkdownDownload({
    url: urlToLoad,
  })

  useEffect(() => {
    const element = ref.current
    if (!element) return
    element.innerHTML = '' // Clear previous content while loading new markdown
    if (!markdown || markdown.length < 1 || !backendPublicUrl) return
    const html = convertExtractionMarkdownToHtml({
      documentId,
      libraryId,
      markdown,
      extractionMethod,
      backendPublicUrl,
    })
    element.innerHTML = html
  }, [markdown, documentId, libraryId, extractionMethod, backendPublicUrl])

  return (
    <div className="size-full overflow-auto rounded-xl bg-base-200 p-6">
      {error && (
        <div className="alert alert-error">
          <span>Error loading markdown: {error.message}</span>
        </div>
      )}
      {bytesLoaded < totalBytes && (
        <div className="flex flex-col items-center gap-4 p-8">
          <progress className="progress w-56 progress-primary" value={progress} max="100"></progress>
          <span className="text-sm">{`Loading ... ${Math.round(progress)}%`}</span>
        </div>
      )}
      {bytesLoaded >= totalBytes && (
        <div className="text-sm">
          <div
            ref={ref}
            className={twMerge(
              'prose prose-sm max-w-none',
              className,
              viewMarkdownSource ? 'invisible h-0' : 'visible',
            )}
          />
          <pre
            className={twMerge(
              'invisible h-0 max-w-none text-sm whitespace-pre-wrap',
              className,
              viewMarkdownSource ? 'visible' : 'invisible h-0',
            )}
          >
            <code lang="markdown">{markdown}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
