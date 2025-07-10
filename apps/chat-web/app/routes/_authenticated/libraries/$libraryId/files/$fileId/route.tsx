import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { reprocessFiles } from '../../../../../../components/library/files/change-files'
import { getFileChunksQueryOptions } from '../../../../../../components/library/files/get-file-chunks'
import { getFileInfoQueryOptions } from '../../../../../../components/library/files/get-file-info'
import { useTranslation } from '../../../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        getFileInfoQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }),
      ),
    ])
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  const params = Route.useParams()
  const { queryClient } = Route.useRouteContext()

  const { data: fileInfo } = useSuspenseQuery(
    getFileInfoQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }),
  )

  const { mutate: reprocessMutate, isPending: reprocessIsPending } = useMutation({
    mutationFn: () => reprocessFiles({ data: [params.fileId] }),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: getFileChunksQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }).queryKey,
      }),
  })
  return (
    <>
      <div>
        <pre>{JSON.stringify(fileInfo, null, 2)}</pre>
      </div>
      <div className="flex justify-between">
        <ul className="menu bg-base-200 lg:menu-horizontal rounded-box">
          <li>
            <Link
              className="btn btn-ghost btn-sm"
              activeProps={{ className: 'btn-active' }}
              activeOptions={{ exact: true }}
              to="/libraries/$libraryId/files/$fileId"
              params={params}
            >
              Content
            </Link>
          </li>
          <li>
            <Link
              className="btn btn-ghost btn-sm"
              activeProps={{ className: 'btn-active' }}
              activeOptions={{ exact: true }}
              to="/libraries/$libraryId/files/$fileId/chunks"
              params={params}
            >
              Chunks
            </Link>
          </li>
        </ul>
        <ul className="menu bg-base-200 lg:menu-horizontal rounded-box">
          <li>
            <button
              type="button"
              className="btn btn-primary btn-xs"
              onClick={() => reprocessMutate()}
              disabled={reprocessIsPending}
            >
              {t('actions.reprocess')}
            </button>
          </li>
        </ul>
      </div>
      <div role="tabpanel" className="md:p-10">
        <Outlet />
      </div>
    </>
  )
}
