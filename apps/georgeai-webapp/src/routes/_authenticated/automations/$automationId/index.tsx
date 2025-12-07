import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getAutomationItemsQueryOptions, getAutomationQueryOptions } from '../../../../components/automations/queries'
import { useAutomationActions } from '../../../../components/automations/use-automation-actions'
import { Pagination } from '../../../../components/table/pagination'
import { useTranslation } from '../../../../i18n/use-translation-hook'
import { PlayIcon } from '../../../../icons/play-icon'

interface AutomationSearchParams {
  page?: number
  pageSize?: number
}

export const Route = createFileRoute('/_authenticated/automations/$automationId/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): AutomationSearchParams => ({
    page: Number(search.page) || 0,
    pageSize: Number(search.pageSize) || 20,
  }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getAutomationQueryOptions(params.automationId))
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  const { triggerAutomationItem, isPending } = useAutomationActions()

  const navigate = Route.useNavigate()
  const { automationId } = Route.useParams()
  const { page = 0, pageSize = 20 } = Route.useSearch()

  const {
    data: { automation },
  } = useSuspenseQuery(getAutomationQueryOptions(automationId))

  const {
    data: {
      automationItems: { totalCount, items },
    },
  } = useSuspenseQuery(
    getAutomationItemsQueryOptions({
      automationId,
      skip: page * pageSize,
      take: pageSize,
    }),
  )

  if (!automation) {
    return <div className="text-error">{t('automations.notFound')}</div>
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <ul className="menu menu-sm menu-horizontal text-base-content/70 w-full items-center gap-4 text-sm">
          <li>
            {t('automations.itemsCount', {
              endItem: page * pageSize + items.length,
              totalCount: totalCount,
              startItem: page * pageSize + 1,
            })}
          </li>
          <li className="grow items-end">
            <Pagination
              totalItems={totalCount}
              itemsPerPage={pageSize}
              currentPage={page + 1}
              onPageChange={(newPage) => {
                navigate({ search: { page: newPage - 1, pageSize }, replace: true })
              }}
              showPageSizeSelector={true}
              onPageSizeChange={(newPageSize) => {
                navigate({ search: { page: 0, pageSize: newPageSize }, replace: true })
              }}
            />
          </li>
        </ul>

        {items.length === 0 ? (
          <div className="text-base-content/50 py-8 text-center">{t('automations.noItems')}</div>
        ) : (
          <table className="table-zebra table w-full">
            <thead>
              <tr>
                <th>{t('automations.itemName')}</th>
                <th>{t('automations.itemStatus')}</th>
                <th>{t('automations.itemInScope')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.listItem.itemName}</td>
                  <td>
                    <span
                      className={`badge ${
                        item.status === 'SUCCESS'
                          ? 'badge-success'
                          : item.status === 'FAILED'
                            ? 'badge-error'
                            : item.status === 'WARNING'
                              ? 'badge-warning'
                              : item.status === 'SKIPPED'
                                ? 'badge-ghost'
                                : 'badge-info'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>{item.inScope ? t('actions.yes') : t('actions.no')}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => triggerAutomationItem({ automationId, itemId: item.id })}
                      disabled={isPending}
                      title={t('automations.runItem')}
                    >
                      <PlayIcon className="size-4" />
                    </button>
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
