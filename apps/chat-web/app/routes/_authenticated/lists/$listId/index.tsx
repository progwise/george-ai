import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'

import { getListQueryOptions } from '../../../../components/lists/get-list'
import { getListFilesQueryOptions } from '../../../../components/lists/get-list-files'
import { ListFilesTable } from '../../../../components/lists/list-files-table'
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
    await Promise.all([
      context.queryClient.ensureQueryData(getListQueryOptions(params.listId)),
      context.queryClient.ensureQueryData(
        getListFilesQueryOptions({
          listId: params.listId,
          skip: 0,
          take: 20,
          orderBy: 'name',
          orderDirection: 'asc',
        }),
      ),
    ])
  },
})

function RouteComponent() {
  const { listId } = Route.useParams()
  const { page = 0, pageSize = 20, orderBy = 'name', orderDirection = 'asc' } = Route.useSearch()
  const { t } = useTranslation()
  const navigate = Route.useNavigate()

  const {
    data: { aiList },
  } = useSuspenseQuery(getListQueryOptions(listId))

  const {
    data: { aiListFiles },
  } = useSuspenseQuery(
    getListFilesQueryOptions({
      listId,
      skip: page * pageSize,
      take: pageSize,
      orderBy,
      orderDirection,
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

      <ListFilesTable listFiles={aiListFiles} onPageChange={handlePageChange} />
    </div>
  )
}
