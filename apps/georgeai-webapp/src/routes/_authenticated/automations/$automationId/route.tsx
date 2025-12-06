import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { AutomationMenu } from '../../../../components/automations/automation-menu'
import { getAutomationQueryOptions, getAutomationsQueryOptions } from '../../../../components/automations/queries'
import { useTranslation } from '../../../../i18n/use-translation-hook'
import { EditIcon } from '../../../../icons/edit-icon'
import { ListViewIcon } from '../../../../icons/list-view-icon'
import { StatisticsIcon } from '../../../../icons/statistics-icon'

export const Route = createFileRoute('/_authenticated/automations/$automationId')({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getAutomationsQueryOptions()),
      context.queryClient.ensureQueryData(getAutomationQueryOptions(params.automationId)),
    ])
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  const params = Route.useParams()

  const {
    data: { automations },
  } = useSuspenseQuery(getAutomationsQueryOptions())
  const {
    data: { automation },
  } = useSuspenseQuery(getAutomationQueryOptions(params.automationId))

  if (!automation) {
    return <div className="text-error">{t('automations.notFound')}</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <AutomationMenu automation={automation} selectableAutomations={automations} />

      <div role="tablist" className="tabs tabs-lift justify-end">
        <Link
          to="/automations/$automationId"
          className="tab"
          params={{ automationId: params.automationId }}
          activeOptions={{ exact: true, includeSearch: false }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          <ListViewIcon />
          {t('automations.items')}
        </Link>
        <Link
          to="/automations/$automationId/batches"
          className="tab"
          params={{ automationId: params.automationId }}
          activeOptions={{ exact: true, includeSearch: false }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          <StatisticsIcon />
          {t('automations.batches')}
        </Link>
        <Link
          to="/automations/$automationId/edit"
          className="tab"
          params={{ automationId: params.automationId }}
          activeOptions={{ exact: true }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          <EditIcon />
          {t('automations.edit')}
        </Link>
        <input type="radio" className="tab hidden" defaultChecked />
        <div className="tab-content bg-base-100 border-base-300 border p-3">
          <div className="relative overflow-scroll">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
