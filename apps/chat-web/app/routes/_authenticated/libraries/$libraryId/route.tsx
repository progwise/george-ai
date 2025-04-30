import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'

import { DeleteLibraryDialog } from '../../../../components/library/delete-library-dialog'
import { getLibrariesQueryOptions } from '../../../../components/library/get-libraries-query-options'
import { getLibraryQueryOptions } from '../../../../components/library/get-library-query-options'
import { LibrarySelector } from '../../../../components/library/library-selector'
import { useTranslation } from '../../../../i18n/use-translation-hook'
import { BackIcon } from '../../../../icons/back-icon'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(getLibrariesQueryOptions(context.user.id))
    context.queryClient.ensureQueryData(getLibraryQueryOptions(params.libraryId))
  },
})

function RouteComponent() {
  const { libraryId } = Route.useParams()
  const { user } = Route.useRouteContext()
  const {
    data: { aiLibraries },
  } = useSuspenseQuery(getLibrariesQueryOptions(user.id))
  const { data: aiLibrary } = useSuspenseQuery(getLibraryQueryOptions(libraryId))

  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex justify-between">
        <div className="w-64">
          <LibrarySelector libraries={aiLibraries} selectedLibrary={aiLibrary} />
        </div>
        <div className="flex gap-2">
          <DeleteLibraryDialog library={aiLibrary} />
          <button
            type="button"
            onClick={() => navigate({ to: '..' })}
            className="btn btn-sm tooltip"
            data-tip={t('tooltips.goToOverview')}
          >
            <BackIcon />
          </button>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-border w-fit">
        <Link
          to="/libraries/$libraryId/edit"
          params={{ libraryId }}
          className="tab"
          activeOptions={{ exact: true }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          {t('actions.edit')}
        </Link>
        <Link
          to="/libraries/$libraryId"
          params={{ libraryId }}
          className="tab"
          activeOptions={{ exact: true }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          {t('labels.files')}
        </Link>
        <Link
          to="/libraries/$libraryId/query"
          params={{ libraryId }}
          className="tab"
          activeOptions={{ exact: true }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          {t('labels.query')}
        </Link>
        <Link
          to="/libraries/$libraryId/crawlers"
          params={{ libraryId }}
          className="tab"
          activeOptions={{ exact: true }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          {t('labels.crawlers')}
        </Link>
      </div>
      <div role="tabpanel" className="p-10">
        <Outlet />
      </div>
    </article>
  )
}
