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

  const selectedMarkdownFileName = markdownFileName || (markdown?.fileName ? markdown.fileName : undefined)
  const isLatestFileSelected =
    selectedMarkdownFileName &&
    aiLibraryFile.latestExtractionMarkdownFileNames?.some((fileName) => fileName === selectedMarkdownFileName)
  return (
    <div className="flex h-full flex-col gap-2 bg-base-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MarkdownFileSelector
            file={aiLibraryFile}
            selectedFileName={selectedMarkdownFileName}
            onChange={(fileName) => navigate({ search: { markdownFileName: fileName || undefined } })}
          />
        </div>
        <div className="flex items-center gap-2">
          {isLatestFileSelected ? (
            <span className="badge badge-sm badge-primary" title="You are viewing the latest extraction file">
              Active
            </span>
          ) : (
            <span className="badge badge-sm badge-warning" title="You are viewing the latest extraction file">
              Outdated
            </span>
          )}
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              className={twMerge('toggle toggle-sm', viewMarkdownSource ? 'toggle-primary' : 'toggle-secondary')}
              checked={viewMarkdownSource}
              onChange={toggleViewMarkdownSource}
            />
            <span className={twMerge(viewMarkdownSource ? 'text-primary' : 'opacity-50')}>Source</span>
          </label>
        </div>
      </div>

      <div className="min-h-0 min-w-0 overflow-auto rounded-box bg-base-300 p-5">
        {!markdown ? (
          <span>No markdown</span>
        ) : viewMarkdownSource ? (
          <pre className="text-sm whitespace-pre-wrap">
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
