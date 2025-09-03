import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { FormattedMarkdown } from '../../../../../../components/formatted-markdown'
import { getFileInfoQueryOptions } from '../../../../../../components/library/files/get-file-info'
import { getMarkdownQueryOptions } from '../../../../../../components/library/files/get-markdown'
import { MarkdownFileSelector } from '../../../../../../components/library/files/markdown-file-selector'
import { useTranslation } from '../../../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/')({
  component: RouteComponent,
  validateSearch: z.object({
    markdownFileName: z.string().optional(),
  }),
  loaderDeps: ({ search: { markdownFileName } }) => ({
    markdownFileName,
  }),
  loader: async ({ context, params, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getFileInfoQueryOptions({ fileId: params.fileId })),
      context.queryClient.ensureQueryData(
        getMarkdownQueryOptions({ fileId: params.fileId, markdownFileName: deps.markdownFileName }),
      ),
    ])
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  const { fileId } = Route.useParams()
  const navigate = Route.useNavigate()
  const { markdownFileName } = Route.useSearch()
  const [viewMarkdownSource, setViewMarkdownSource] = useState(false)

  const toggleViewMarkdownSource = () => {
    setViewMarkdownSource((prev) => !prev)
  }
  const {
    data: { aiLibraryFile },
  } = useSuspenseQuery(getFileInfoQueryOptions({ fileId: fileId }))
  const {
    data: {
      aiLibraryFile: { markdown: markdown },
    },
  } = useSuspenseQuery(getMarkdownQueryOptions({ fileId: fileId, markdownFileName }))

  return (
    <div className="bg-base-100 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {aiLibraryFile.latestExtractionMarkdownFileNames?.some((fileName) => fileName === markdownFileName) ? (
            <div className="badge badge-info badge-sm">
              Latest Markdown File{' '}
              <strong>{markdown.fileName || aiLibraryFile.latestExtractionMarkdownFileNames.join(', ')}</strong>
            </div>
          ) : (
            <div className="badge badge-ghost badge-sm">
              Showing Markdown File <strong>{markdown.fileName}</strong>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={twMerge('btn btn-info btn-xs btn-outline rounded-full', viewMarkdownSource && 'btn-active')}
            onClick={toggleViewMarkdownSource}
          >
            <>View Source</>
          </button>
          <MarkdownFileSelector
            file={aiLibraryFile}
            onChange={(fileName) => navigate({ search: { markdownFileName: fileName || undefined } })}
          />
        </div>
      </div>

      <div className="bg-base-300 rounded-box p-5">
        {viewMarkdownSource ? (
          <pre className="whitespace-pre-wrap break-words text-sm">
            <code lang="markdown">{markdown.content || t('files.noContentAvailable')}</code>
          </pre>
        ) : (
          <FormattedMarkdown
            markdown={markdown.content || t('files.noContentAvailable')}
            className="text-sm font-semibold"
          />
        )}
      </div>
    </div>
  )
}
