import { createFileRoute } from '@tanstack/react-router'
import { queryKeys } from '../../query-keys'
import { createServerFn } from '@tanstack/start'
import { backendRequest } from '../../server-functions/backend'
import { graphql } from '../../gql'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useAuth } from '../../auth/auth-context'
import { LoadingSpinner } from '../../components/loading-spinner'

const GetConversationsQueryDocument = graphql(`
  query getConversations($ownerId: String!) {
    aiConversations(ownerId: $ownerId) {
      id
      createdAt
      updatedAt
      participants {
        id
      }
      messages {
        id
        createdAt
        updatedAt
        content
        sender {
          id
        }
      }
    }
  }
`)

const getConversations = createServerFn({ method: 'GET' })
  .validator((data: string) => data)
  .handler(async (ctx) =>
    backendRequest(GetConversationsQueryDocument, { ownerId: ctx.data }),
  )

const conversationsQueryOptions = (ownerId?: string) => ({
  queryKey: [queryKeys.Conversations, ownerId],
  queryFn: () => (ownerId ? getConversations({ data: ownerId }) : null),
  enabled: ownerId !== undefined,
})

export const Route = createFileRoute('/conversations/')({
  component: RouteComponent,
})

function RouteComponent() {
  const auth = useAuth()
  const { data, isLoading } = useSuspenseQuery(
    conversationsQueryOptions(auth.user?.id),
  )

  if (isLoading) return <LoadingSpinner />
  return (
    <div>
      Hello "/conversations/"
      <table className="table">
        {data?.aiConversations?.map((conversation) => (
          <tr key={conversation.id}>
            <td>{conversation.id}</td>
          </tr>
        ))}
      </table>
    </div>
  )
}
