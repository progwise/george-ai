import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { getLibrariesQueryOptions } from '../../../../components/library/get-libraries'
import { getLibraryQueryOptions } from '../../../../components/library/get-library'
import { LibraryDeleteDialog } from '../../../../components/library/library-delete-dialog'
import { LibraryParticipants } from '../../../../components/library/library-participants'
import { LibrarySelector } from '../../../../components/library/library-selector'
import { useTranslation } from '../../../../i18n/use-translation-hook'
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
  const { user } = Route.useRouteContext()

  return (
    <article>
      <div className="mb-4 flex w-full items-center justify-between">
        <ul className="bg-base-200 menu menu-horizontal rounded-box gap-2">
          <li>
            <LibrarySelector libraries={aiLibraries} selectedLibrary={aiLibrary} />
          </li>
          <li>
            <Link
              to="/libraries/$libraryId"
              params={{ libraryId }}
              className="btn btn-sm"
              activeOptions={{ exact: true }}
              activeProps={{ className: 'btn-active' }}
              role="tab"
            >
              {t('labels.details')}
            </Link>
          </li>
          <li>
            <Link
              to="/libraries/$libraryId/postprocess"
              params={{ libraryId }}
              className="btn btn-sm"
              activeOptions={{ exact: false }}
              activeProps={{ className: 'btn-active' }}
              role="tab"
            >
              {t('labels.postprocess')}
            </Link>
          </li>
          <li>
            <Link
              to="/libraries/$libraryId/files"
              params={{ libraryId }}
              className="btn btn-sm"
              activeOptions={{ exact: false }}
              activeProps={{ className: 'btn-active' }}
              role="tab"
            >
              {t('labels.files')}
            </Link>
          </li>
          <li>
            <Link
              to="/libraries/$libraryId/query"
              params={{ libraryId }}
              className="btn btn-sm"
              activeOptions={{ exact: false }}
              activeProps={{ className: 'btn-active' }}
              role="tab"
            >
              {t('labels.query')}
            </Link>
          </li>
          <li>
            <Link
              to="/libraries/$libraryId/crawlers"
              params={{ libraryId }}
              className="btn btn-sm"
              activeOptions={{ exact: false }}
              activeProps={{ className: 'btn-active' }}
              role="tab"
            >
              {t('labels.crawlers')}
            </Link>
          </li>
          <li>
            <Link
              to="/libraries/$libraryId/processing"
              params={{ libraryId }}
              className="btn btn-sm"
              activeOptions={{ exact: false }}
              activeProps={{ className: 'btn-active' }}
              role="tab"
            >
              {t('labels.processing')}
            </Link>
          </li>
          <li>
            <Link
              to="/libraries/$libraryId/updates"
              params={{ libraryId }}
              className="btn btn-sm"
              activeOptions={{ exact: false }}
              activeProps={{ className: 'btn-active' }}
              role="tab"
            >
              {t('labels.updates')}
            </Link>
          </li>
        </ul>
        <ul className="bg-base-200 menu menu-horizontal rounded-box float-right">
          <li className="flex items-center">
            <LibraryParticipants library={aiLibrary} users={usersData.users} userId={user.id} />
          </li>
          {user.id === aiLibrary.ownerId && (
            <li>
              <LibraryDeleteDialog library={aiLibrary} />
            </li>
          )}
        </ul>
      </div>
      <div>
        <Outlet />
      </div>
    </article>
  )
}
