import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getAutomationItemsQueryOptions, getAutomationQueryOptions } from '../../../../components/automations/queries'
import { useTranslation } from '../../../../i18n/use-translation-hook'

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

  const { automationId } = Route.useParams()
  const { page = 0, pageSize = 20 } = Route.useSearch()

  const {
    data: { automation },
  } = useSuspenseQuery(getAutomationQueryOptions(automationId))

  const { data } = useSuspenseQuery(
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
        <div className="text-base-content/70 text-sm">
          {t('automations.itemsCount', { count: data.automationItems.length })}
        </div>

        {data.automationItems.length === 0 ? (
          <div className="text-base-content/50 py-8 text-center">{t('automations.noItems')}</div>
        ) : (
          <table className="table-zebra table w-full">
            <thead>
              <tr>
                <th>{t('automations.itemName')}</th>
                <th>{t('automations.itemStatus')}</th>
                <th>{t('automations.itemInScope')}</th>
              </tr>
            </thead>
            <tbody>
              {data.automationItems.map((item) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
