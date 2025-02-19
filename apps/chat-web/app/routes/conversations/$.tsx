import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useAuth } from '../../auth/auth-context'
import { ConversationHistory } from '../../components/conversation/conversation-history'
import { ConversationForm } from '../../components/conversation/conversation-form'
import { useRef } from 'react'
import { ConversationSelector } from '../../components/conversation/conversation-selector'
import { NewConversationDialog } from '../../components/conversation/new-conversation-dialog'
import { ConversationParticipants } from '../../components/conversation/conversation-participants'
import { DeleteConversationDialog } from '../../components/conversation/delete-conversation-dialog'
import { CircleCrossIcon } from '../../icons/circle-cross-icon'
import { graphql } from '../../gql'
import { createServerFn } from '@tanstack/start'
import { backendRequest } from '../../server-functions/backend'
import { LoadingSpinner } from '../../components/loading-spinner'
import { queryKeys } from '../../query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'
import { z } from 'zod'

const ConversationsQueryDocument = graphql(`
  query getUserConversations($userId: String!) {
    aiConversations(userId: $userId) {
      id
      ...ConversationSelector_conversations
    }
  }
`)

export const getConversations = createServerFn({ method: 'GET' })
  .validator((data: { userId: string }) =>
    z.object({ userId: z.string() }).parse(data),
  )
  .handler(async (ctx) => backendRequest(ConversationsQueryDocument, ctx.data))

const ConversationQueryDocument = graphql(`
  query getConversation($conversationId: String!) {
    aiConversation(conversationId: $conversationId) {
      ...ConversationForm_conversation
      ...ConversationParticipants_conversation
      ...ConversationDelete_conversation
      ...ConversationHistory_conversation
    }
  }
`)

export const getConversation = createServerFn({ method: 'GET' })
  .validator((data: { conversationId: string }) =>
    z.object({ conversationId: z.string() }).parse(data),
  )
  .handler(async (ctx) => backendRequest(ConversationQueryDocument, ctx.data))

const AssignableUsersDocument = graphql(`
  query getAssignableUsers($userId: String!) {
    myConversationUsers(userId: $userId) {
      ...ConversationNew_HumanParticipationCandidates
      ...ConversationParticipants_HumanParticipationCandidates
    }
  }
`)

export const getAssignableHumans = createServerFn({ method: 'GET' })
  .validator((data: { userId: string }) =>
    z.object({ userId: z.string() }).parse(data),
  )
  .handler(async (ctx) => backendRequest(AssignableUsersDocument, ctx.data))

const AssignableAssistantsDocument = graphql(`
  query getAssignableAssistants($ownerId: String!) {
    aiAssistants(ownerId: $ownerId) {
      ...ConversationNew_AssistantParticipationCandidates
      ...ConversationParticipants_AssistantParticipationCandidates
    }
  }
`)

export const getAssignableAssistants = createServerFn({ method: 'GET' })
  .validator((data: { ownerId: string }) =>
    z.object({ ownerId: z.string() }).parse(data),
  )
  .handler(async (ctx) =>
    backendRequest(AssignableAssistantsDocument, ctx.data),
  )

export const Route = createFileRoute('/conversations/$')({
  component: RouteComponent,
  beforeLoad: async ({ params }) => {
    return {
      selectedConversationId: params._splat as string,
    }
  },
  loader: async ({ context }) => {
    const { selectedConversationId, auth } = context
    if (!auth.user?.id) {
      return {
        conversations: null,
        selectedConversation: null,
        assignableUsers: null,
        assignableAssistants: null,
      }
    }
    const userId = auth.user?.id
    const queryClient = context.queryClient

    queryClient.prefetchQuery({
      queryKey: [queryKeys.Conversations, userId],
      queryFn: () => getConversations({ data: { userId } }),
    })
    queryClient.prefetchQuery({
      queryKey: [queryKeys.Conversation, selectedConversationId],
      queryFn: () =>
        getConversation({
          data: { conversationId: selectedConversationId },
        }),
    })
    queryClient.prefetchQuery({
      queryKey: [queryKeys.ConversationAssignableUsers, userId],
      queryFn: () => getAssignableHumans({ data: { userId } }),
    })
    await queryClient.prefetchQuery({
      queryKey: [queryKeys.ConversationAssignableAssistants, userId],
      queryFn: () => getAssignableAssistants({ data: { ownerId: userId } }),
    })
  },
})

function RouteComponent() {
  const auth = useAuth()
  const userId = auth.user?.id
  const navigate = useNavigate()

  const { _splat } = useParams({ strict: false })

  const selectedConversationId = _splat as string

  const newDialogRef = useRef<HTMLDialogElement>(null)

  const deleteDialogRef = useRef<HTMLDialogElement>(null)

  const { data: conversations, isLoading: conversationsLoading } =
    useSuspenseQuery({
      queryKey: [queryKeys.Conversations, userId],
      queryFn: async () =>
        userId ? await getConversations({ data: { userId } }) : null,
    })

  const {
    data: selectedConversation,
    isLoading: selectedConversationIsLoading,
  } = useSuspenseQuery({
    queryKey: [queryKeys.Conversation, selectedConversationId],
    queryFn: async () =>
      selectedConversationId
        ? await getConversation({
            data: { conversationId: selectedConversationId },
          })
        : null,
  })

  const { data: assignableUsers, isLoading: assignableUsersIsLoading } =
    useSuspenseQuery({
      queryKey: [queryKeys.ConversationAssignableUsers, userId],
      queryFn: async () =>
        userId ? await getAssignableHumans({ data: { userId } }) : null,
    })

  const {
    data: assignableAssistants,
    isLoading: assignableAssistantsIsLoading,
  } = useSuspenseQuery({
    queryKey: [queryKeys.ConversationAssignableAssistants, userId],
    queryFn: async () =>
      userId
        ? await getAssignableAssistants({ data: { ownerId: userId } })
        : null,
  })

  if (!userId) {
    return <h3>Login to use conversations.</h3>
  }

  if (
    (conversations?.aiConversations?.length || 0) > 0 &&
    !selectedConversationId
  ) {
    navigate({ to: `/conversations/${conversations?.aiConversations?.[0].id}` })
  }

  const handleNewConversation = () => {
    newDialogRef.current?.showModal()
  }

  const handleDeleteConversation = () => {
    deleteDialogRef.current?.showModal()
  }

  if (
    conversationsLoading ||
    selectedConversationIsLoading ||
    assignableUsersIsLoading ||
    assignableAssistantsIsLoading ||
    !assignableAssistants ||
    !assignableUsers ||
    !conversations
  ) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex gap-4">
      <NewConversationDialog
        ref={newDialogRef}
        humans={assignableUsers.myConversationUsers}
        assistants={assignableAssistants.aiAssistants}
      />

      {selectedConversation?.aiConversation && (
        <DeleteConversationDialog
          ref={deleteDialogRef}
          conversation={selectedConversation.aiConversation}
        />
      )}

      {userId && (
        <nav>
          <div className="flex justify-between items-center p-4">
            <>
              {' '}
              <h3>Recent</h3>
              <button
                type="button"
                className="btn btn-sm"
                onClick={handleNewConversation}
              >
                New
              </button>
            </>
          </div>
          {conversations.aiConversations && (
            <ConversationSelector
              conversations={conversations.aiConversations}
              selectedConversationId={selectedConversationId}
            />
          )}
        </nav>
      )}
      <article className="flex flex-col gap-4 w-full">
        {selectedConversation?.aiConversation && (
          <>
            <div className="flex justify-between items-center border-b-2">
              <ConversationParticipants
                conversation={selectedConversation.aiConversation}
                assistantCandidates={assignableAssistants.aiAssistants}
                humanCandidates={assignableUsers.myConversationUsers}
              />
              <button
                type="button"
                className="btn btn-cicle btn-sm btn-ghost text-red-500"
                onClick={handleDeleteConversation}
              >
                <CircleCrossIcon /> Conversation
              </button>
            </div>
            <ConversationHistory
              conversation={selectedConversation.aiConversation}
            />

            <ConversationForm
              conversation={selectedConversation.aiConversation}
            />
          </>
        )}
      </article>
    </div>
  )
}
