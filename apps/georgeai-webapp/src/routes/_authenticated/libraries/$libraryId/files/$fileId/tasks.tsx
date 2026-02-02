import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/tasks')({
  component: RouteComponent,
  validateSearch: z.object({
    skip: z.coerce.number().default(0),
    take: z.coerce.number().default(20),
  }),
  loaderDeps: ({ search: { skip, take } }) => ({
    skip,
    take,
  }),
  // loader: async ({ context, params, deps }) => {},
})

function RouteComponent() {
  const { libraryId, fileId } = Route.useParams()
  const { skip, take } = Route.useSearch()

  return (
    <div className="flex h-full flex-col gap-2 bg-base-100">
      Not implemented yet.
      <span>
        This is a placeholder for the tasks page for file {fileId} in library {libraryId} with skip {skip} and take{' '}
        {take}.
      </span>
    </div>
  )
}
