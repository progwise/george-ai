import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'

import { dateStringShort, timeString } from '@george-ai/web-utils'

import { getLibrariesQueryOptions } from '../../../components/library/get-libraries-query-options'
import { LibraryNewDialog } from '../../../components/library/library-new-dialog'
import { useTranslation } from '../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(getLibrariesQueryOptions(context.user.id))
  },
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()
  const { data } = useSuspenseQuery(getLibrariesQueryOptions(user.id))

  const { t, language } = useTranslation()

  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{t('libraries.myLibraries')}</h3>
        <LibraryNewDialog userId={user.id} />
      </div>

      <div className="overflow-x-auto">
        {!data?.aiLibraries || data.aiLibraries.length < 1 ? (
          <h3>{t('libraries.noLibrariesFound')}</h3>
        ) : (
          <table className="table w-full">
            <thead className="hidden md:table-header-group">
              <tr>
                <th>#</th>
                <th>{t('labels.name')}</th>
                <th>{t('libraries.owner')}</th>
                <th>{t('libraries.lastUpdate')}</th>
              </tr>
            </thead>

            <tbody>
              {data?.aiLibraries?.map((library, index) => {
                const datePart = dateStringShort(library.updatedAt ?? library.createdAt, language)
                const timePart = timeString(library.updatedAt ?? library.createdAt, language)

                return (
                  <tr
                    key={library.id}
                    className="relative my-1 block border-b pr-20 leading-tight hover:bg-gray-100 md:table-row"
                    onClick={() => navigate({ to: '/libraries/$libraryId', params: { libraryId: library.id } })}
                  >
                    <td data-label="#" className="hidden py-1 md:table-cell md:py-2">
                      {index + 1}
                    </td>
                    <td data-label="Name" className="block py-1 md:table-cell md:py-2">
                      <Link to={'/libraries/$libraryId'} params={{ libraryId: library.id }}>
                        <span className="font-bold hover:underline">{library.name}</span>
                      </Link>
                    </td>
                    <td data-label="Owner" className="block py-1 md:table-cell md:py-2">
                      {library.owner?.name}
                    </td>
                    <td
                      data-label="Last update"
                      className="absolute right-0 top-0 block py-1 text-right md:static md:table-cell md:py-2"
                    >
                      <div className="flex flex-col items-end leading-tight md:flex-row md:gap-2">
                        <span>{datePart}</span>
                        <span>{timePart}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </article>
  )
}

export default RouteComponent
