import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { CurrentUser, useAuth } from '../../auth/auth-hook'
import { graphql } from '../../gql'
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
  .validator((ownerId: string) => {
    return z.string().nonempty().parse(ownerId)
  })
  .handler(async (ctx) => {
    return await backendRequest(librariesDocument, { ownerId: ctx.data })
  })

const librariesQueryOptions = (ownerId?: string) =>
  queryOptions({
    queryKey: [queryKeys.AiLibraries, ownerId],
    queryFn: async () => {
      if (!ownerId) {
        return null
      } else {
        return getLibraries({ data: ownerId })
      }
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

      <div className="flex flex-wrap gap-4">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Owner</th>
              <th>Last update</th>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {data?.aiLibraries?.map((library, index) => (
              <tr key={library.id} className="hover:bg-gray-100">
                <td>{index + 1}</td>
                <td>{library.name}</td>
                <td>{library.owner?.name}</td>
                <td>{library.updatedAt || library.createdAt}</td>
                <td>
                  <Link
                    className="btn btn-outline btn-xs"
                    to={'/libraries/$libraryId'}
                    params={{ libraryId: library.id }}
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}
