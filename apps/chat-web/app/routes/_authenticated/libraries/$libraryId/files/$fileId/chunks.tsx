import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { FormattedMarkdown } from '../../../../../../components/formatted-markdown'
import { getFileChunksQueryOptions } from '../../../../../../components/library/files/get-file-chunks'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/chunks')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        getFileChunksQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }),
      ),
    ])
  },
})

function RouteComponent() {
  const { data } = useSuspenseQuery(
    getFileChunksQueryOptions({
      fileId: Route.useParams().fileId,
      libraryId: Route.useParams().libraryId,
    }),
  )
  const chunks = data.readFileChunks
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">{chunks.length} Chunks for file </h2>
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
