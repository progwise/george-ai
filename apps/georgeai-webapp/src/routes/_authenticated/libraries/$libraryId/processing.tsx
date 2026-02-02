import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { aiLibraryFilesQueryOptions } from '../../../../components/library/files/get-files'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/processing')({
  component: RouteComponent,
  validateSearch: z.object({
    skip: z.coerce.number().default(0),
    take: z.coerce.number().default(20),
  }),
  loaderDeps: ({ search: { skip, take } }) => ({
    skip,
    take,
  }),
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        aiLibraryFilesQueryOptions({
          libraryId: params.libraryId,
          skip: 0,
          take: 1,
        }),
      ),
    ])
  },
})

function RouteComponent() {
  const { libraryId } = Route.useParams()
  const { skip, take } = Route.useSearch()

  return (
    <div className="grid size-full grid-rows-[auto_1fr] bg-base-100">
      Not implemented yet.
      <span>
        This is a placeholder for the processing page for library {libraryId} with skip {skip} and take {take}.
      </span>
    </div>
  )
}
