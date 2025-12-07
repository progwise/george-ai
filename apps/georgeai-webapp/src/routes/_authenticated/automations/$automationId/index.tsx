import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'

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

  const subTitle = useMemo(() => {
    if (!automation) return ''
    const targets = automation.connectorActionConfig?.fieldMappings.map((f) => f.targetField).join(', ')
    return `${automation.list.name} → ${targets || t('automations.notConfigured')}`
  }, [automation, t])

  if (!automation) {
    return <div className="text-error">{t('automations.notFound')}</div>
  }

  return (
    <div className="bg-base-100 grid h-full w-full grid-rows-[auto_1fr] gap-2">
      <ul className="menu menu-sm menu-horizontal text-base-content/70 bg-base-200 w-full items-center">
        <li className="menu-title">
          <span>{subTitle}</span>
        </li>
        <li className="grow items-end">
          {t('automations.itemsCount', {
            endItem: page * pageSize + items.length,
            totalCount: totalCount,
            startItem: page * pageSize + 1,
          })}
        </li>
        <li>
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

      <div className="block h-full w-full overflow-auto">
        {items.length === 0 ? (
          <div className="text-base-content/50 py-8 text-center">{t('automations.noItems')}</div>
        ) : (
          <table className="table-zebra table-sm table-pin-rows table-pin-cols table">
            <thead>
              <tr>
                <th className="text-base-content/50">#</th>
                <th>{t('automations.itemName')}</th>
                <td>{t('automations.itemInScope')}</td>
                <th>{t('automations.itemAction')}</th>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="hover:bg-base-300">
                  <th className="text-base-content/50">{page * pageSize + index + 1}</th>
                  <th>
                    <div>
                      <Link
                        to="/lists/$listId"
                        params={{
                          listId: item.listItem.listId,
                        }}
                        search={{ selectedItemId: item.listItemId }}
                      >
                        {item.listItem.itemName}
                      </Link>
                    </div>
                    <div>
                      <span
                        className={`badge badge-xs text-base-content/70 ${
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
                    </div>
                  </th>

                  <td>
                    {item.inScope ? (
                      <input type="checkbox" checked className="checkbox checkbox-success checkbox-xs" />
                    ) : (
                      <input type="checkbox" className="checkbox checkbox-warning checkbox-xs" />
                    )}
                  </td>
                  <td></td>
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
