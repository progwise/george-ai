import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'

import { FileCaptionLink, FileMenu, FileNavigation } from '../../../../components/library/files'
import { LibraryMenu } from '../../../../components/library/library-menu'
import { LibraryNavigation } from '../../../../components/library/library-navigation'
import { getLibraryQueryOptions } from '../../../../components/library/queries/get-library'
import { ArrowRight } from '../../../../icons/arrow-right'
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

  return (
    <div className="grid h-[calc(100dvh-6rem)] grid-rows-[auto_auto_1fr] gap-4">
      <div className="truncate">
        <div className={twMerge(`flex flex-row items-center justify-center gap-1`)}>
          <Link to="/libraries/$libraryId/files" params={{ libraryId }} className="flex items-center">
            <LibraryIcon className="mr-2" />
            <h3 className={twMerge('text-xl text-nowrap', !fileId && 'font-bold')}>{library.name}</h3>
          </Link>
          {!fileId && <LibraryMenu library={library} />}
          {fileId && <ArrowRight className="mx-2" />}
          {fileId && <FileCaptionLink libraryId={libraryId} fileId={fileId} />}
        </div>
        {fileId && <FileMenu fileId={fileId} libraryId={libraryId} />}
        {fileId && <FileNavigation fileId={fileId} libraryId={libraryId} />}
        {!fileId && <LibraryNavigation libraryId={libraryId} />}
      </div>

      <div className="min-h-0 justify-items-center overflow-hidden p-3">
        <Outlet />
      </div>
    </div>
  )
}
