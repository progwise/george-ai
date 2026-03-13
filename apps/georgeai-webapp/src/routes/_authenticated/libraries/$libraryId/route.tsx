import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'

import { FileNavigation } from '../../../../components/library/files'
import { LibraryMenu } from '../../../../components/library/library-menu'
import { getLibraryQueryOptions } from '../../../../components/library/queries/get-library'
import { useTranslation } from '../../../../i18n/use-translation-hook'
import { LibraryIcon } from '../../../../icons/library-icon'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([context.queryClient.ensureQueryData(getLibraryQueryOptions(params.libraryId))])
  },
})

function RouteComponent() {
  const { libraryId } = Route.useParams()
  const { fileId } = useParams({ strict: false })
  const { data: library } = useSuspenseQuery(getLibraryQueryOptions(libraryId))

  const { t } = useTranslation()

  return (
    <div className="grid h-[calc(100dvh-6rem)] grid-rows-[auto_auto_1fr] gap-4">
      <div className="flex flex-row items-center justify-center gap-1">
        <Link to="/libraries/$libraryId/files" params={{ libraryId }} className="flex items-center">
          <LibraryIcon className="mr-2" />
          <h3 className="text-xl font-bold text-nowrap">{library.name}</h3>
        </Link>
        <LibraryMenu library={library} />
      </div>
      {fileId && <FileNavigation fileId={fileId} libraryId={libraryId} />}
      <div role="tablist" className={twMerge(`tabs-lift tabs`, fileId && 'hidden')}>
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
        <a className="tab tab-disabled flex-1 cursor-default text-center">
          {/* Placeholder empty tab for filling up the line... */}
        </a>
      </div>
      <div className="min-h-0 overflow-hidden bg-base-100 p-3">
        <Outlet />
      </div>
    </div>
  )
}
