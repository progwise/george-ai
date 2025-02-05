import { createFileRoute, Link } from '@tanstack/react-router'
import { graphql } from '../../gql'
import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { backendRequest } from '../../server-functions/backend'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { queryKeys } from '../../query-keys'
import { useAuth } from '../../auth/auth-context'

const knowledgeSourcesDocument = graphql(/* GraphQL */ `
  query aiKnowledgeSources($ownerId: String!) {
    aiKnowledgeSources(ownerId: $ownerId) {
      id
      name
      aiKnowledgeSourceType
      owner {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`)

const getKnowledgeSources = createServerFn({ method: 'GET' })
  .validator((ownerId: string) => {
    return z.string().nonempty().parse(ownerId)
  })
  .handler(async (ctx) => {
    return await backendRequest(knowledgeSourcesDocument, { ownerId: ctx.data })
  })

const knowledgeSourcesQueryOptions = (ownerId?: string) =>
  queryOptions({
    queryKey: [queryKeys.KnowledgeSources, ownerId],
    queryFn: async () => {
      if (!ownerId) {
        return null
      } else {
        return getKnowledgeSources({ data: ownerId })
      }
    },
    enabled: !!ownerId,
  })

export const Route = createFileRoute('/knowledge/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(
      knowledgeSourcesQueryOptions(context.auth.user?.id),
    )
  },
})

function RouteComponent() {
  const auth = useAuth()
  const { data, isLoading } = useSuspenseQuery(
    knowledgeSourcesQueryOptions(auth.user?.id),
  )
  const isLoggendIn = !!auth?.user

  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold">
          {!isLoggendIn ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => auth?.login()}
            >
              Log in to see your Knowledge Sources
            </button>
          ) : (
            'My Knowledge Sources'
          )}
        </h3>
        {isLoading && <span className="loading loading-ring loading-md"></span>}
        {isLoggendIn && (
          <Link
            type="button"
            className="btn btn-primary btn-sm"
            to="/knowledge/new"
          >
            Add new
          </Link>
        )}
      </div>

      <div className="flex gap-4 flex-wrap">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Type</th>
              <th>owner</th>
              <th>Last update</th>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {data?.aiKnowledgeSources?.map((knowledgeSource, index) => (
              <tr key={knowledgeSource.id} className="hover:bg-gray-100">
                <td>{index + 1}</td>
                <td>{knowledgeSource.name}</td>
                <td>{knowledgeSource.aiKnowledgeSourceType}</td>
                <td>{knowledgeSource.owner?.name}</td>
                <td>
                  {knowledgeSource.updatedAt || knowledgeSource.createdAt}
                </td>
                <td>
                  <Link
                    className="btn btn-ghost btn-xs"
                    to={'/knowledge/$knowledgeSourceId'}
                    params={{ knowledgeSourceId: knowledgeSource.id }}
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
