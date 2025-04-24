import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { dateStringShort, timeString } from '@george-ai/web-utils'

import { LibraryNewDialog } from '../../../components/library/library-new-dialog'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const librariesDocument = graphql(`
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

export const Route = createFileRoute('/_authenticated/libraries/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(librariesQueryOptions(context.user.id))
  },
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()
  const { data, isLoading } = useSuspenseQuery(librariesQueryOptions(user.id))

  const { t, language } = useTranslation()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{t('libraries.myLibraries')}</h3>
        <LibraryNewDialog userId={user.id} />
      </div>

      {!data?.aiLibraries || data.aiLibraries.length < 1 ? (
        <h3>{t('libraries.noLibrariesFound')}</h3>
      ) : (
        <table className="table">
          <thead>
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
                  className="hover:bg-base-200"
                  onClick={() =>
                    navigate({
                      to: '/libraries/$libraryId',
                      params: { libraryId: library.id },
                    })
                  }
                >
                  <td data-label="#">{index + 1}</td>
                  <td data-label="Name">
                    <Link to={'/libraries/$libraryId'} params={{ libraryId: library.id }}>
                      <span className="font-bold hover:underline">{library.name}</span>
                    </Link>
                  </td>
                  <td data-label="Owner">{library.owner?.name}</td>
                  <td data-label="Last update">
                    {datePart} {timePart}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </article>
  )
}

export default RouteComponent
