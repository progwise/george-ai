import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useRef, useState } from 'react'
import { z } from 'zod'

import { useAuth } from '../../auth/auth-hook'
import { ConversationForm } from '../../components/conversation/conversation-form'
import { ConversationHistory } from '../../components/conversation/conversation-history'
import { ConversationParticipants } from '../../components/conversation/conversation-participants'
import { ConversationSelector } from '../../components/conversation/conversation-selector'
import { DeleteConversationDialog } from '../../components/conversation/delete-conversation-dialog'
import { NewConversationDialog } from '../../components/conversation/new-conversation-dialog'
import { LoadingSpinner } from '../../components/loading-spinner'
import { graphql } from '../../gql'
import { MenuIcon } from '../../icons/menu-icon'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

const ConversationsQueryDocument = graphql(`
  query getUserConversations($userId: String!) {
    aiConversations(userId: $userId) {
      id
      ...ConversationSelector_conversations
    }
  }
`)

export const getConversations = createServerFn({ method: 'GET' })
  .validator((data: { userId: string }) => z.object({ userId: z.string() }).parse(data))
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
  .validator((data: { conversationId: string }) => z.object({ conversationId: z.string() }).parse(data))
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
  .validator((data: { userId: string }) => z.object({ userId: z.string() }).parse(data))
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
  .validator((data: { ownerId: string }) => z.object({ ownerId: z.string() }).parse(data))
  .handler(async (ctx) => backendRequest(AssignableAssistantsDocument, ctx.data))

export const Route = createFileRoute('/conversations/$')({
  component: RouteComponent,
  beforeLoad: async ({ params }) => {
    return {
      selectedConversationId: params._splat as string,
    }
  },
})

function RouteComponent() {
  const auth = useAuth()
  const userId = auth.user?.id
  const navigate = useNavigate()
  const { _splat } = useParams({ strict: false })
  const selectedConversationId = _splat as string

  const { data: conversations, isLoading: conversationsLoading } = useSuspenseQuery({
    queryKey: [queryKeys.Conversations, userId],
    queryFn: async () => (userId ? await getConversations({ data: { userId } }) : null),
  })

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const drawerCheckboxReference = useRef<HTMLInputElement>(null)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    document.body.style.overflow = isMenuOpen ? 'auto' : 'hidden'
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    if (drawerCheckboxReference.current) {
      drawerCheckboxReference.current.checked = false
    }
  }

  const { data: selectedConversation, isLoading: selectedConversationIsLoading } = useSuspenseQuery({
    queryKey: [queryKeys.Conversation, selectedConversationId],
    queryFn: async () =>
      selectedConversationId
        ? await getConversation({
            data: { conversationId: selectedConversationId },
          })
        : null,
  })

  const { data: assignableUsers, isLoading: assignableUsersIsLoading } = useSuspenseQuery({
    queryKey: [queryKeys.ConversationAssignableUsers, userId],
    queryFn: async () => (userId ? await getAssignableHumans({ data: { userId } }) : null),
  })

  const { data: assignableAssistants, isLoading: assignableAssistantsIsLoading } = useSuspenseQuery({
    queryKey: [queryKeys.ConversationAssignableAssistants, userId],
    queryFn: async () => (userId ? await getAssignableAssistants({ data: { ownerId: userId } }) : null),
  })

  if (!userId) {
    return <h3>Login to use conversations.</h3>
  }

  if ((conversations?.aiConversations?.length || 0) > 0 && !selectedConversationId) {
    navigate({ to: `/conversations/${conversations?.aiConversations?.[0].id}` })
  }

  if (
    conversationsLoading ||
    selectedConversationIsLoading ||
    assignableUsersIsLoading ||
    assignableAssistantsIsLoading ||
    !assignableUsers ||
    !assignableAssistants ||
    !conversations
  ) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex gap-4 lg:flex-row">
      {userId && (
        <div className="relative flex flex-col gap-2">
          <div className="flex justify-between">
            <button type="button" className="btn btn-sm lg:hidden" onClick={toggleMenu}>
              <MenuIcon className="size-6" />
            </button>
            <NewConversationDialog
              humans={assignableUsers.myConversationUsers}
              assistants={assignableAssistants.aiAssistants}
              isOpen={conversations?.aiConversations?.length === 0}
            />
          </div>

          {isMenuOpen && <div className="fixed inset-0 z-10 lg:hidden" onClick={closeMenu} />}

          <div
            ref={menuRef}
            className={`absolute z-20 w-72 rounded-md border shadow-md ${
              isMenuOpen ? 'top-10 block' : 'hidden'
            } lg:static lg:block`}
          >
            {conversations.aiConversations && (
              <ConversationSelector
                conversations={conversations.aiConversations}
                selectedConversationId={selectedConversationId}
                onClick={closeMenu}
              />
            )}
          </div>
        </div>
      )}
      <article className="flex w-full flex-col gap-4">
        {selectedConversation?.aiConversation && (
          <>
            <div className="flex items-center justify-between">
              <ConversationParticipants
                conversation={selectedConversation.aiConversation}
                assistantCandidates={assignableAssistants.aiAssistants}
                humanCandidates={assignableUsers.myConversationUsers}
              />
              <DeleteConversationDialog conversation={selectedConversation.aiConversation} />
            </div>
            <ConversationHistory conversation={selectedConversation.aiConversation} />
            <ConversationForm conversation={selectedConversation.aiConversation} />
          </>
        )}
      </article>
    </div>
  )
}
