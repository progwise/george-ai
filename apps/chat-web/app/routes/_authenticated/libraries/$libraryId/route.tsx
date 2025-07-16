import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'

import { getLibrariesQueryOptions } from '../../../../components/library/get-libraries'
import { getLibraryQueryOptions } from '../../../../components/library/get-library'
import { LibraryDeleteOrLeaveDialogButton } from '../../../../components/library/library-delete-or-leave-dialog-button/library-delete-or-leave-dialog-button'
import { LibraryParticipants } from '../../../../components/library/library-participants'
import { LibrarySelector } from '../../../../components/library/library-selector'
import { useTranslation } from '../../../../i18n/use-translation-hook'
import { BackIcon } from '../../../../icons/back-icon'
import { getUsersQueryOptions } from '../../../../server-functions/users'

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
  const { data: usersData } = useSuspenseQuery(getUsersQueryOptions())

  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = Route.useRouteContext()

  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex justify-between gap-2">
        <div className="w-64">
          <LibrarySelector libraries={aiLibraries} selectedLibrary={aiLibrary} />
        </div>
        <div className="flex min-w-0 gap-2">
          <LibraryParticipants library={aiLibrary} users={usersData.users} userId={user.id} />
          <LibraryDeleteOrLeaveDialogButton library={aiLibrary} userId={user.id} />
          <button
            type="button"
            onClick={() => navigate({ to: '..' })}
            className="btn btn-sm tooltip tooltip-left"
            data-tip={t('tooltips.goToOverview')}
          >
            <BackIcon />
          </button>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-border w-fit">
        <Link
          to="/libraries/$libraryId"
          params={{ libraryId }}
          className="tab"
          activeOptions={{ exact: true }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          {t('labels.summary')}
        </Link>
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
      <div role="tabpanel" className="md:p-10">
        <Outlet />
      </div>
    </article>
  )
}
