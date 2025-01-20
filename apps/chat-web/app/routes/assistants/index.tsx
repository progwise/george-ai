import { createFileRoute, Link } from '@tanstack/react-router'
import { request } from 'graphql-request'
import { useQuery } from '@tanstack/react-query'
import { graphql } from '../../gql/gql'
import { useAuth } from '../../auth'
import { AssistantCard } from '../../components/assistant-card'
import { queryKeys } from '../../query-keys'
import { BACKEND_GRAPHQL_URL } from '../../constants'
import { createServerFn } from '@tanstack/start'
import { z } from 'zod'

const myAssistantsDocument = graphql(/* GraphQL */ `
  query aiAssistantCards($ownerId: String!) {
    aiAssistants(ownerId: $ownerId) {
      id
      name
      description
      icon
      aiAssistantType
      createdAt
      ownerId
    }
  }
`)

const getAiAssistants = createServerFn({ method: 'GET' })
  .validator((ownerId: string) => z.string().nonempty().parse(ownerId))
  .handler(async (ctx) =>
    request(BACKEND_GRAPHQL_URL, myAssistantsDocument, {
      ownerId: ctx.data,
    }),
  )

export const Route = createFileRoute('/assistants/')({
  component: RouteComponent,
})

function RouteComponent() {
  const authContext = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.AiAssistants, authContext?.user?.id],
    enabled: !!authContext?.user,
    queryFn: async () => {
      if (!authContext?.user?.id) {
        return null
      } else {
        return getAiAssistants({ data: authContext.user.id })
      }
    },
  })
  const isLoggendIn = !!authContext?.user

  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold">
          {!isLoggendIn ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => authContext?.login()}
            >
              Log in to see your assistants
            </button>
          ) : (
            'My Assistants'
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
        {data?.aiAssistants?.map((assistant) => (
          <AssistantCard key={assistant.id} assistant={assistant} />
        ))}
      </div>
    </article>
  )
}
