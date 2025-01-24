import { createFileRoute, Link } from '@tanstack/react-router'
import { graphql } from '../../gql'
import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { backendRequest } from '../../server-functions/backend'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../query-keys'
import { useAuth } from '../../auth/auth-context'

const knowledgeSourcesDocument = graphql(/* GraphQL */ `
  query aiKnowledgeSources($ownerId: String!) {
    aiKnowledgeSources(ownerId: $ownerId) {
      id
      name
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

export const Route = createFileRoute('/knowledge/')({
  component: RouteComponent,
})

function RouteComponent() {
  const auth = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.KnowledgeSources, auth?.user?.id],
    enabled: !!auth?.user,
    queryFn: async () => {
      if (!auth?.user?.id) {
        return null
      } else {
        return getKnowledgeSources({ data: auth.user.id })
      }
    },
  })
  const isLoggendIn = !!auth?.user

  const someNumber = 1.23
  return (
    <article className="flex w-full flex-col gap-4">
      <input
        className="input input-sm input-bordered"
        type="number"
        defaultValue={someNumber}
      />
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
            to="/assistants/new"
          >
            Add new
          </Link>
        )}
      </div>

      <div className="flex gap-4 flex-wrap">
        {data?.aiKnowledgeSources?.map((knowledgeSource) => (
          <div key={knowledgeSource.id}>{knowledgeSource.name}</div>
        ))}
      </div>
    </article>
  )
}
