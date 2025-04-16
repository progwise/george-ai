import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { dateStringShort, timeString } from '@george-ai/web-utils'

import { CurrentUser, useAuth } from '../../auth/auth-hook'
import { LibraryNewDialog } from '../../components/library/library-new-dialog'
import { LoadingSpinner } from '../../components/loading-spinner'
import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

const librariesDocument = graphql(/* GraphQL */ `
  query aiLibraries($ownerId: String!) {
    aiLibraries(ownerId: $ownerId) {
      id
      name
      owner {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`)

const getLibraries = createServerFn({ method: 'GET' })
  .validator((ownerId: string) => z.string().nonempty().parse(ownerId))
  .handler(async (ctx) => {
    return backendRequest(librariesDocument, { ownerId: ctx.data })
  })

const librariesQueryOptions = (ownerId?: string) =>
  queryOptions({
    queryKey: [queryKeys.AiLibraries, ownerId],
    queryFn: async () => {
      if (!ownerId) return null
      return getLibraries({ data: ownerId })
    },
    enabled: !!ownerId,
  })

export const Route = createFileRoute('/libraries/')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const currentUser = context.queryClient.getQueryData<CurrentUser>([queryKeys.CurrentUser])
    return { ownerId: currentUser?.id }
  },
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(librariesQueryOptions(context.ownerId))
  },
})

function RouteComponent() {
  const auth = useAuth()
  const navigate = useNavigate()
  const { data, isLoading } = useSuspenseQuery(librariesQueryOptions(auth.user?.id))
  const isLoggedIn = !!auth?.user

  const { t, language } = useTranslation()

  if (!isLoggedIn) {
    return (
      <button type="button" className="btn btn-ghost" onClick={() => auth?.login()}>
        {t('libraries.signInForLibraries')}
      </button>
    )
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{t('libraries.myLibraries')}</h3>
        {isLoading && <span className="loading loading-ring loading-md"></span>}
        {isLoggedIn && <LibraryNewDialog />}
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
                    className="relative my-1 block border-b pr-20 leading-tight hover:bg-base-300 md:table-row"
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
