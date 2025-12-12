import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { EnrichmentAccordionItem } from '../../../../components/lists/enrichment-accordion-item'
import { getListQueryOptions } from '../../../../components/lists/queries'
import { getEnrichmentsQueryOptions } from '../../../../components/lists/queries/get-enrichments'
import { Pagination } from '../../../../components/table/pagination'
import { EnrichmentStatus, ListFieldSourceType } from '../../../../gql/graphql'
import { useTranslation } from '../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/lists/$listId/enrichments')({
  component: RouteComponent,
  validateSearch: z.object({
    skip: z.coerce.number().default(0),
    take: z.coerce.number().default(20),
    fieldId: z.string().optional(),
    status: z.nativeEnum(EnrichmentStatus).optional(),
  }),
  loaderDeps: ({ search: { skip, take, fieldId, status } }) => ({
    skip,
    take,
    fieldId,
    status,
  }),
  loader: async ({ context, params, deps }) => {
    await context.queryClient.ensureQueryData(
      getEnrichmentsQueryOptions({
        listId: params.listId,
        skip: deps.skip,
        take: deps.take,
        fieldId: deps.fieldId,
        status: deps.status,
      }),
    )
  },
})

function RouteComponent() {
  const { listId } = Route.useParams()
  const { skip = 0, take = 20, fieldId, status } = Route.useSearch()
  const navigate = Route.useNavigate()

  const {
    data: { aiList },
  } = useSuspenseQuery(getListQueryOptions(listId))

  const {
    data: {
      aiListEnrichments: { enrichments, totalCount, statusCounts },
    },
  } = useSuspenseQuery(
    getEnrichmentsQueryOptions({
      listId,
      skip,
      take,
      fieldId,
      status,
    }),
  )
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-base-content/80">
            {totalCount === 1
              ? t('lists.enrichmentCount', { count: totalCount.toString() })
              : t('lists.enrichmentsCount', { count: totalCount.toString() })}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {statusCounts.map(({ status, count }) => (
              <div
                key={status}
                className={twMerge(
                  'badge px-2 py-1 badge-sm',
                  status === EnrichmentStatus.Processing && 'badge-primary',
                  status === EnrichmentStatus.Pending && 'badge-info',
                  status === EnrichmentStatus.Completed && 'badge-success',
                  status === EnrichmentStatus.Error && 'badge-error',
                  status === EnrichmentStatus.Failed && 'badge-warning',
                  status === EnrichmentStatus.Canceled && 'badge-secondary',
                )}
              >
                {status}: {count}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-4">
          <div className="flex items-center gap-2">
            <select
              className="select h-full select-sm text-nowrap"
              value={fieldId || ''}
              onChange={(e) => {
                const selectedFieldId = e.target.value === '*' ? undefined : e.target.value
                navigate({ search: { skip: 0, take, fieldId: selectedFieldId, status } })
              }}
            >
              <option value="*">All fields</option>
              {aiList.fields
                ?.filter((field) => field.sourceType === ListFieldSourceType.LlmComputed)
                .map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name}
                  </option>
                ))}
            </select>
            <select
              className="select h-full select-sm text-nowrap"
              value={status || ''}
              onChange={(e) => {
                const selectedStatus = e.target.value as EnrichmentStatus | ''
                navigate({ search: { skip: 0, take, status: selectedStatus || undefined } })
              }}
            >
              <option value="">All</option>
              <option value={EnrichmentStatus.Pending}>Pending</option>
              <option value={EnrichmentStatus.Processing}>In progress</option>
              <option value={EnrichmentStatus.Canceled}>Cancelled</option>
              <option value={EnrichmentStatus.Completed}>Completed</option>
              <option value={EnrichmentStatus.Failed}>Failed</option>
              <option value={EnrichmentStatus.Error}>Error</option>
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
        <div className="join-vertical join w-full bg-base-100">
          {enrichments.map((enrichment, index) => (
            <EnrichmentAccordionItem key={enrichment.id} enrichment={enrichment} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
