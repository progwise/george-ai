import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { ListMenu } from '../../../../components/lists/list-menu'
import { getListQueryOptions } from '../../../../components/lists/queries'
import { useTranslation } from '../../../../i18n/use-translation-hook'
import { EditIcon } from '../../../../icons/edit-icon'
import { ListViewIcon } from '../../../../icons/list-view-icon'
import { StatisticsIcon } from '../../../../icons/statistics-icon'

export const Route = createFileRoute('/_authenticated/lists/$listId')({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    await Promise.all([context.queryClient.ensureQueryData(getListQueryOptions(params.listId))])
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  const params = Route.useParams()

  const {
    data: { aiList },
  } = useSuspenseQuery(getListQueryOptions(params.listId))

  return (
    <div className="grid h-[calc(100dvh-6rem)] grid-rows-[auto_auto_1fr] gap-4">
      <div className="flex flex-row items-center justify-center gap-1">
        <ListViewIcon className="mr-2" />
        <h3 className="text-xl font-bold text-nowrap">{aiList.name}</h3>
        <ListMenu list={aiList} />
      </div>
      <div role="tablist" className="tabs-lift tabs justify-end">
        <a className="tab tab-disabled flex-1 cursor-default text-center">
          {/* Placeholder empty tab for filling up the line... */}
        </a>
        <Link
          to="/lists/$listId"
          className="tab"
          params={{ listId: params.listId }}
          activeOptions={{ exact: true, includeSearch: false }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          <ListViewIcon />
          {t('lists.view')}
        </Link>
        <Link
          to="/lists/$listId/enrichments"
          className="tab"
          params={{ listId: params.listId }}
          activeOptions={{ exact: true, includeSearch: false }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          <EditIcon />
          {t('lists.enrichments')}
        </Link>
        <Link
          to="/lists/$listId/statistics"
          className="tab"
          params={{ listId: params.listId }}
          activeOptions={{ exact: true }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          <StatisticsIcon />
          {t('lists.statistics.tabTitle')}
        </Link>
        <Link
          to="/lists/$listId/edit"
          className="tab"
          params={{ listId: params.listId }}
          activeOptions={{ exact: true }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          <EditIcon />
          {t('lists.edit')}
        </Link>
      </div>
      <div className="min-h-0 w-full bg-base-100 p-3">
        <Outlet />
      </div>
    </div>
  )
}
