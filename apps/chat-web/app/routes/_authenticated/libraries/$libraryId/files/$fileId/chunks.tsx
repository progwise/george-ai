import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { FormattedMarkdown } from '../../../../../../components/formatted-markdown'
import { getFileChunksQueryOptions } from '../../../../../../components/library/files/get-file-chunks'
import { getFileInfoQueryOptions } from '../../../../../../components/library/files/get-file-info'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/chunks')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        getFileChunksQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }),
      ),
      context.queryClient.ensureQueryData(
        getFileInfoQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }),
      ),
    ])
  },
})

function RouteComponent() {
  const { fileId, libraryId } = Route.useParams()
  const {
    data: { readFileChunks: chunks },
  } = useSuspenseQuery(
    getFileChunksQueryOptions({
      fileId,
      libraryId,
    }),
  )
  const {
    data: { aiLibraryFile },
  } = useSuspenseQuery(getFileInfoQueryOptions({ fileId, libraryId }))
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">
        {chunks.length} Chunks for file &quot;{aiLibraryFile.name}&quot;
      </h2>
      <div className="flex flex-wrap gap-4">
        {chunks.map((chunk) => (
          <div key={chunk.id} className="card card-border bg-base-200 card-xs shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Chunk {chunk.chunkIndex + 1}</h2>
              <p>
                Semantic Path:
                {chunk.headingPath}
              </p>
              <div>
                <FormattedMarkdown markdown={chunk.text} className="text-xs" />
              </div>
              <hr />
              <div className="card-actions justify-end">Internal Chunk Id: {chunk.id}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
