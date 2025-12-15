import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { ClientDate } from '../../../../../../components/client-date'
import { getFileUsagesQueryOptions } from '../../../../../../components/library/files/get-file-usages'
import { Pagination } from '../../../../../../components/table/pagination'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/usages')({
  component: RouteComponent,
  validateSearch: z.object({
    skipUsages: z.coerce.number().default(0),
    takeUsages: z.coerce.number().default(20),
  }),
  loaderDeps: ({ search: { skipUsages, takeUsages } }) => ({
    skipUsages,
    takeUsages,
  }),
  loader: async ({ context, params, deps }) => {
    await context.queryClient.ensureQueryData(
      getFileUsagesQueryOptions({
        fileId: params.fileId,
        skip: deps.skipUsages,
        take: deps.takeUsages,
      }),
    )
  },
})

function RouteComponent() {
  const { fileId } = Route.useParams()
  const { skipUsages, takeUsages } = Route.useSearch()
  const navigate = Route.useNavigate()

  const {
    data: { aiFileUsages },
  } = useSuspenseQuery(
    getFileUsagesQueryOptions({
      fileId,
      skip: skipUsages,
      take: takeUsages,
    }),
  )

  return (
    <div className="grid size-full grid-rows-[auto_1fr] bg-base-100">
      {/* Header Section */}
      <div>
        <div className="mb-4 flex w-full items-end justify-between">
          <h3 className="text-xl font-bold">
            Usage {aiFileUsages.skip + 1} - {Math.min(aiFileUsages.skip + aiFileUsages.take, aiFileUsages.count)} of{' '}
            {aiFileUsages.count} Usages
          </h3>
          <Pagination
            totalItems={aiFileUsages.count}
            itemsPerPage={takeUsages}
            currentPage={1 + aiFileUsages.skip / takeUsages}
            onPageChange={(page) => {
              navigate({ search: { skipUsages: (page - 1) * takeUsages, takeUsages } })
            }}
            showPageSizeSelector={true}
            onPageSizeChange={(newPageSize) => {
              navigate({ search: { skipUsages: 0, takeUsages: newPageSize } })
            }}
          />
        </div>
      </div>

      <div className="overflow-auto">
        {aiFileUsages.count === 0 ? (
          <div className="alert">
            <div>
              <h4 className="font-bold">No Usages Found</h4>
              <p className="text-sm">This file is not currently used in any lists.</p>
            </div>
          </div>
        ) : (
          <table className="table-pin-rows table-pin-cols table table-zebra table-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>List</th>
                <th>Item Name</th>
                <th>Chunk Count</th>
                <th>Extraction Index</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {aiFileUsages.usages.map((usage, index) => (
                <tr key={usage.id} className="hover:bg-base-300">
                  <th className="text-nowrap">{skipUsages + index + 1}</th>
                  <td>
                    <Link
                      to="/lists/$listId"
                      params={{ listId: usage.listId }}
                      search={{ selectedItemId: usage.id }}
                      className="link link-hover"
                    >
                      {usage.listName}
                    </Link>
                  </td>
                  <td className="max-w-xs truncate" title={usage.itemName}>
                    {usage.itemName}
                  </td>
                  <td className="text-nowrap">{usage.chunkCount}</td>
                  <td className="text-nowrap">
                    {usage.extractionIndex !== null && usage.extractionIndex !== undefined
                      ? `#${usage.extractionIndex + 1}`
                      : '-'}
                  </td>
                  <td className="text-nowrap">
                    <ClientDate date={usage.createdAt} format="dateTime" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
