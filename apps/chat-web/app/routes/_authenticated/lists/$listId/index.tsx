import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'

import { ListFieldsTable } from '../../../../components/lists/list-fields-table'
import { getListFilesWithValuesQueryOptions, getListQueryOptions } from '../../../../components/lists/server-functions'
import { useTranslation } from '../../../../i18n/use-translation-hook'

interface ListSearchParams {
  page?: number
  pageSize?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export const Route = createFileRoute('/_authenticated/lists/$listId/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): ListSearchParams => ({
    page: Number(search.page) || 0,
    pageSize: Number(search.pageSize) || 20,
    orderBy: (search.orderBy as string) || 'name',
    orderDirection: (search.orderDirection as 'asc' | 'desc') || 'asc',
  }),
  loader: async ({ context, params }) => {
    // Load initial data - let the component handle search params
    // Note: We only load the list data here, the files will be loaded by the component
    // with the proper field IDs and language after the list data is available
    await context.queryClient.ensureQueryData(getListQueryOptions(params.listId))
  },
})

function RouteComponent() {
  const { listId } = Route.useParams()
  const { page = 0, pageSize = 20, orderBy = 'name', orderDirection = 'asc' } = Route.useSearch()
  const { t, language } = useTranslation()
  const navigate = Route.useNavigate()

  const {
    data: { aiList },
  } = useSuspenseQuery(getListQueryOptions(listId))

  // Check if there are any active enrichments for the files query
  const hasActiveEnrichments = aiList.fields.some(
    (field) => field.pendingItemsCount > 0 || field.processingItemsCount > 0,
  )

  // Get field IDs for the query
  const fieldIds = aiList.fields.map((field) => field.id)

  const {
    data: { aiListFiles },
  } = useSuspenseQuery(
    getListFilesWithValuesQueryOptions({
      listId,
      skip: page * pageSize,
      take: pageSize,
      orderBy,
      orderDirection,
      fieldIds,
      language,
      hasActiveEnrichments,
    }),
  )

  const handlePageChange = useCallback(
    (newPage: number, newPageSize: number, newOrderBy?: string, newOrderDirection?: 'asc' | 'desc') => {
      navigate({
        search: {
          page: newPage,
          pageSize: newPageSize,
          orderBy: newOrderBy || orderBy,
          orderDirection: newOrderDirection || orderDirection,
        },
        replace: true,
      })
    },
    [navigate, orderBy, orderDirection],
  )

  return (
    <div className="space-y-6">
      <div>
        <p className="text-base-content/70">
          {t('lists.files.title')} - {aiList.sources.length} {t('lists.sources.currentSources').toLowerCase()}
        </p>
      </div>

      <ListFieldsTable list={aiList} listFiles={aiListFiles} onPageChange={handlePageChange} />
    </div>
  )
}
