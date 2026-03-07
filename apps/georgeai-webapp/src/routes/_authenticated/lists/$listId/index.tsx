import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'

import { ListFieldsTable } from '../../../../components/lists/list-fields-table'
import { ListFieldsTableFilterBadges } from '../../../../components/lists/list-fields-table-filter-badges'
import { ListFieldsTableMenu } from '../../../../components/lists/list-fields-table-menu'
import { getListItemsQueryOptions, getListQueryOptions } from '../../../../components/lists/queries'
import { useFieldSettings } from '../../../../components/lists/use-field-settings'
import { useListSettings } from '../../../../components/lists/use-list-settings'
import { Pagination } from '../../../../components/table/pagination'
import { useTranslation } from '../../../../i18n/use-translation-hook'

interface ListSearchParams {
  page?: number
  pageSize?: number
  selectedItemId?: string
}

export const Route = createFileRoute('/_authenticated/lists/$listId/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): ListSearchParams => ({
    page: Number(search.page) || 0,
    pageSize: Number(search.pageSize) || 20,
    selectedItemId: search.selectedItemId ? String(search.selectedItemId) : undefined,
  }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getListQueryOptions(params.listId))
  },
})

function RouteComponent() {
  const { t } = useTranslation()

  const { listId } = Route.useParams()
  const { page = 0, pageSize = 20, selectedItemId } = Route.useSearch()
  const navigate = Route.useNavigate()

  const {
    data: { aiList },
  } = useSuspenseQuery(getListQueryOptions(listId))

  const { filters, sorting } = useListSettings(listId)

  const { visibleFields } = useFieldSettings(aiList.fields || [])

  const { data: aiListItems } = useSuspenseQuery(
    getListItemsQueryOptions({
      listId,
      skip: page * pageSize,
      take: pageSize,
      fieldIds: visibleFields.map((f) => f.id),
      sorting,
      filters,
      selectedItemId,
    }),
  )

  const handlePageChange = useCallback(
    (newPage: number, newPageSize: number) => {
      navigate({
        search: {
          page: newPage,
          pageSize: newPageSize,
        },
        replace: true,
      })
    },
    [navigate],
  )

  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null
    const item = aiListItems.items.find((item) => item.id === selectedItemId)
    if (!item) return null
    return { id: selectedItemId, name: item?.origin.name }
  }, [aiListItems.items, selectedItemId])

  return (
    <div className="grid grid-rows-[auto_1fr] justify-center bg-base-100">
      {/* Controls */}
      <div className="flex justify-between align-top">
        <div className="z-49 md:flex">
          <ListFieldsTableMenu list={aiList} fields={aiList.fields} unfilteredCount={aiListItems.unfilteredCount} />
        </div>
        <div className="text-sm">
          {/* Summary */}
          <div className="text-sm text-base-content/70">
            {t('lists.files.showing', {
              start: page * pageSize + 1,
              end: Math.min((page + 1) * pageSize, aiListItems.count),
              total: aiListItems.count,
            })}
          </div>
          {/* Pagination with page size selector */}
          <Pagination
            totalItems={aiListItems.count}
            itemsPerPage={pageSize}
            currentPage={page + 1} // Convert from 0-based to 1-based
            onPageChange={(page) => handlePageChange(page - 1, pageSize)} // Convert back to 0-based
            showPageSizeSelector={true}
            onPageSizeChange={(newPageSize) => handlePageChange(0, newPageSize)}
          />
        </div>
      </div>
      {/* Always occupies 2 rows of filter badges to prevent layout shift */}
      <div className="min-h-18">
        <ListFieldsTableFilterBadges listId={aiList.id} fields={aiList.fields} selectedItem={selectedItem} />
      </div>
      <div className="max-h-[80vh] min-h-30 overflow-x-auto">
        <ListFieldsTable list={aiList} listItems={aiListItems} />
      </div>
    </div>
  )
}
