import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { LibraryMenu } from '../../../../components/library/library-menu'
import { getLibrariesQueryOptions } from '../../../../components/library/queries/get-libraries'
import { getLibraryQueryOptions } from '../../../../components/library/queries/get-library'
import { useTranslation } from '../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getLibrariesQueryOptions()),
      context.queryClient.ensureQueryData(getLibraryQueryOptions(params.libraryId)),
    ])
  },
})

function RouteComponent() {
  const { libraryId } = Route.useParams()
  const {
    data: { aiLibraries },
  } = useSuspenseQuery(getLibrariesQueryOptions())
  const { data: aiLibrary } = useSuspenseQuery(getLibraryQueryOptions(libraryId))

  const { t } = useTranslation()

  return (
    <div className="grid h-[calc(100dvh-6rem)] w-[calc(100dvw-4rem)] grid-rows-[auto_auto_1fr] gap-4">
      <div>
        <LibraryMenu library={aiLibrary} selectableLibraries={aiLibraries} />
      </div>
      <div role="tablist" className="tabs tabs-lift justify-end">
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
      <div className="bg-base-100 min-h-0 w-full p-3">
        <Outlet />
      </div>
    </div>
  )
}
