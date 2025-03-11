import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { dateTimeString } from '@george-ai/web-utils'

import { CurrentUser, useAuth } from '../../auth/auth-hook'
import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

const librariesDocument = graphql(/* GraphQL */ `
  query aiLibraries($ownerId: String!) {
    aiLibraries(ownerId: $ownerId) {
      id
      name
      libraryType
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
    return {
      ownerId: currentUser?.id,
    }
  },
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(librariesQueryOptions(context.ownerId))
  },
})

function RouteComponent() {
  const auth = useAuth()
  const { data, isLoading } = useSuspenseQuery(librariesQueryOptions(auth.user?.id))
  const isLoggedIn = !!auth?.user

  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">
          {!isLoggedIn ? (
            <button type="button" className="btn btn-ghost" onClick={() => auth?.login()}>
              Log in to see your Libraries
            </button>
          ) : (
            'My Libraries'
          )}
        </h3>
        {isLoading && <span className="loading loading-ring loading-md"></span>}
        {isLoggedIn && (
          <Link type="button" className="btn btn-primary btn-sm" to="/libraries/new">
            Add new
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead className="hidden md:table-header-group">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Type</th>
              <th>Owner</th>
              <th className="text-right">Last update</th>
            </tr>
          </thead>

          <tbody>
            {data?.aiLibraries?.map((library, index) => {
              const displayedDate = dateTimeString(library.updatedAt ?? library.createdAt, 'en')

              return (
                <tr key={library.id} className="my-2 block border-b hover:bg-gray-100 md:my-0 md:table-row">
                  <td data-label="#" className="block px-2 py-1 md:table-cell md:py-2">
                    {index + 1}
                  </td>
                  <td data-label="Name" className="block px-2 py-1 md:table-cell md:py-2">
                    <Link
                      to={'/libraries/$libraryId'}
                      params={{ libraryId: library.id }}
                      className="text-blue-600 hover:underline"
                    >
                      {library.name}
                    </Link>
                  </td>
                  <td data-label="Type" className="block px-2 py-1 md:table-cell md:py-2">
                    {library.libraryType}
                  </td>
                  <td data-label="Owner" className="block px-2 py-1 md:table-cell md:py-2">
                    {library.owner?.name}
                  </td>
                  <td data-label="Last update" className="block px-2 py-1 text-right md:table-cell md:py-2">
                    {displayedDate}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </article>
  )
}
