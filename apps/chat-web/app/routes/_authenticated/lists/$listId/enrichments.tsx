import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { EnrichmentAccordionItem } from '../../../../components/lists/enrichment-accordion-item'
import { getEnrichmentsQueryOptions } from '../../../../components/lists/queries/get-enrichments'
import { Pagination } from '../../../../components/table/pagination'
import { EnrichmentStatus } from '../../../../gql/graphql'

export const Route = createFileRoute('/_authenticated/lists/$listId/enrichments')({
  component: RouteComponent,
  validateSearch: z.object({
    skip: z.coerce.number().default(0),
    take: z.coerce.number().default(20),
    status: z.nativeEnum(EnrichmentStatus).optional(),
  }),
  loaderDeps: ({ search: { skip, take, status } }) => ({
    skip,
    take,
    status,
  }),
  loader: async ({ context, params, deps }) => {
    await context.queryClient.ensureQueryData(
      getEnrichmentsQueryOptions({
        listId: params.listId,
        skip: deps.skip,
        take: deps.take,
        status: deps.status,
      }),
    )
  },
})

function RouteComponent() {
  const { listId } = Route.useParams()
  const { skip = 0, take = 20, status } = Route.useSearch()
  const navigate = Route.useNavigate()

  const {
    data: {
      aiListEnrichments: { enrichments, totalCount },
    },
  } = useSuspenseQuery(
    getEnrichmentsQueryOptions({
      listId,
      skip,
      take,
      status,
    }),
  )
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base-content/80 text-xl font-bold">Enrichments</h2>
        <div className="flex items-end gap-4">
          <div>
            <select
              className="select select-sm select-bordered h-full"
              value={status || ''}
              onChange={(e) => {
                const selectedStatus = e.target.value as EnrichmentStatus | ''
                navigate({ search: { skip: 0, take, status: selectedStatus || undefined } })
              }}
            >
              <option value="">All Statuses</option>
              <option value={EnrichmentStatus.Pending}>Pending</option>
              <option value={EnrichmentStatus.InProgress}>In progress</option>
              <option value={EnrichmentStatus.Canceled}>Cancelled</option>
              <option value={EnrichmentStatus.Completed}>Completed</option>
              <option value={EnrichmentStatus.Failed}>Failed</option>
            </select>
          </div>
          <Pagination
            totalItems={totalCount}
            itemsPerPage={take}
            currentPage={1 + skip / take}
            onPageChange={(page) => {
              navigate({ search: { skip: (page - 1) * take, take, status } })
            }}
            showPageSizeSelector={true}
            onPageSizeChange={(newPageSize) => {
              navigate({ search: { skip: 0, take: newPageSize, status } })
            }}
          />
        </div>
      </div>

      {enrichments.length === 0 ? (
        <div className="card bg-base-200">
          <div className="card-body text-center">
            <p className="text-base-content/60">No Enrichment found</p>
          </div>
        </div>
      ) : (
        <div className="join join-vertical bg-base-100 w-full">
          {enrichments.map((enrichment, index) => (
            <EnrichmentAccordionItem key={enrichment.id} enrichment={enrichment} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
