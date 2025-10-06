import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { getLibrariesQueryOptions } from '../../../../components/library/get-libraries'
import { getLibraryQueryOptions } from '../../../../components/library/get-library'
import { LibraryMenu } from '../../../../components/library/library-menu'
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
    <div className="flex flex-col gap-4">
      <LibraryMenu library={aiLibrary} selectableLibraries={aiLibraries} />
      <div role="tablist" className="tabs tabs-lift justify-end">
        <Link
          to="/libraries/$libraryId"
          params={{ libraryId }}
          className="tab"
          activeOptions={{ exact: true }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          {t('labels.details')}
        </Link>
        <Link
          to="/libraries/$libraryId/postprocess"
          params={{ libraryId }}
          className="tab"
          activeOptions={{ exact: false }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          {t('labels.postprocess')}
        </Link>
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
      <input type="radio" className="tab hidden" defaultChecked />
      <div className="tab-content bg-base-100 border-base-300 border p-3">
        <div className="max-w-dvw relative max-h-[100dvh] overflow-scroll">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
