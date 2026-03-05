import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { LibraryMenu } from '../../../../components/library/library-menu'
import { getLibraryQueryOptions } from '../../../../components/library/queries/get-library'
import { useTranslation } from '../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([context.queryClient.ensureQueryData(getLibraryQueryOptions(params.libraryId))])
  },
})

function RouteComponent() {
  const { libraryId } = Route.useParams()
  const { data: library } = useSuspenseQuery(getLibraryQueryOptions(libraryId))

  const { t } = useTranslation()

  return (
    <div className="grid h-[calc(100dvh-6rem)] grid-rows-[auto_auto_1fr] gap-4">
      <div className="flex flex-row items-center justify-center gap-1">
        <h3 className="text-xl font-bold text-nowrap">{library.name}</h3>
        <LibraryMenu library={library} />
      </div>
      <div role="tablist" className="tabs-lift tabs justify-end">
        <a className="tab tab-disabled flex-1 cursor-default text-center">
          {/* Placeholder empty tab for filling up the line... */}
        </a>
        <Link
          to="/libraries/$libraryId/files"
          params={{ libraryId }}
          className="tab"
          activeOptions={{ exact: false }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          {t('labels.files')}
        </Link>
        <Link
          to="/libraries/$libraryId/crawlers"
          params={{ libraryId }}
          className="tab"
          activeOptions={{ exact: false }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          {t('labels.crawlers')}
        </Link>
        <Link
          to="/libraries/$libraryId/query"
          params={{ libraryId }}
          className="tab"
          activeOptions={{ exact: false }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          {t('labels.query')}
        </Link>
        <Link
          to="/libraries/$libraryId/processing"
          params={{ libraryId }}
          className="tab"
          activeOptions={{ exact: false }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          {t('labels.processing')}
        </Link>
        <Link
          to="/libraries/$libraryId/settings"
          params={{ libraryId }}
          className="tab"
          activeOptions={{ exact: false }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          {t('labels.settings')}
        </Link>
        <Link
          to="/libraries/$libraryId/updates"
          params={{ libraryId }}
          className="tab"
          activeOptions={{ exact: false }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          {t('labels.updates')}
        </Link>
      </div>
      <div className="min-h-0 bg-base-100 p-3">
        <Outlet />
      </div>
    </div>
  )
}
