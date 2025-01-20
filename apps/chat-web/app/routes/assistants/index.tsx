import { createFileRoute, Link } from '@tanstack/react-router'
import { request } from 'graphql-request'
import { useQuery } from '@tanstack/react-query'
import { graphql } from '../../gql/gql'
import { useAuth } from '../../auth'
import { AssistantCard } from '../../components/assistant-card'
import { queryKeys } from '../../query-keys'
import { BACKEND_GRAPHQL_URL } from '../../constants'

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

export const Route = createFileRoute('/assistants/')({
  component: RouteComponent,
})

function RouteComponent() {
  const authContext = useAuth()
  const { data, status } = useQuery({
    queryKey: [queryKeys.AiAssistants, authContext?.user?.id],
    enabled: !!authContext?.user,
    queryFn: async () =>
      request(
        BACKEND_GRAPHQL_URL,
        myAssistantsDocument,
        // variables are type-checked too!
        { ownerId: authContext!.user!.id },
      ),
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
        <div className="badge badge-secondary badge-outline">{status}</div>
        <Link
          type="button"
          className="btn btn-primary btn-sm"
          to="/assistants/new"
        >
          Add new
        </Link>
      </div>

      <div className="flex gap-4 flex-wrap">
        {data?.aiAssistants?.map((assistant) => (
          <AssistantCard key={assistant.id} assistant={assistant} />
        ))}
      </div>
    </article>
  )
}
