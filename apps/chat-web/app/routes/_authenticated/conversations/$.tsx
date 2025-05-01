import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'
import { z } from 'zod'

import { getProfileQueryOptions } from '../../../auth/get-profile-query'
import { ConversationForm } from '../../../components/conversation/conversation-form'
import { ConversationHistory } from '../../../components/conversation/conversation-history'
import { ConversationParticipants } from '../../../components/conversation/conversation-participants'
import { ConversationSelector } from '../../../components/conversation/conversation-selector'
import { DeleteLeaveConversationDialog } from '../../../components/conversation/delete-leave-conversation-dialog'
import { NewConversationSelector } from '../../../components/conversation/new-conversation-selector'
import { ParticipantsDialog } from '../../../components/conversation/participants-dialog'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { graphql } from '../../../gql'
import { MenuIcon } from '../../../icons/menu-icon'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const ConversationsQueryDocument = graphql(`
  query getUserConversations($userId: String!) {
    aiConversations(userId: $userId) {
      id
      ...ConversationSelector_Conversation
    }
  }
`)

export const getConversations = createServerFn({ method: 'GET' })
  .validator((data: { userId: string }) => z.object({ userId: z.string() }).parse(data))
  .handler(async (ctx) => backendRequest(ConversationsQueryDocument, ctx.data))

const ConversationQueryDocument = graphql(`
  query getConversation($conversationId: String!) {
    aiConversation(conversationId: $conversationId) {
      ...ConversationParticipants_Conversation
      ...ConversationDelete_Conversation
      ...ConversationHistory_Conversation
      ...ConversationForm_Conversation
      ...ParticipantsDialog_Conversation
    }
  }
`)

export const getConversation = createServerFn({ method: 'GET' })
  .validator((data: { conversationId: string }) => z.object({ conversationId: z.string() }).parse(data))
  .handler(async (ctx) => backendRequest(ConversationQueryDocument, ctx.data))

const AssignableUsersDocument = graphql(`
  query getAssignableUsers($userId: String!) {
    myConversationUsers(userId: $userId) {
      ...NewConversationSelector_Human
      ...ConversationParticipants_Human
      ...ParticipantsDialog_Human
    }
  }
`)

export const getAssignableHumans = createServerFn({ method: 'GET' })
  .validator((data: { userId: string }) => z.object({ userId: z.string() }).parse(data))
  .handler(async (ctx) => backendRequest(AssignableUsersDocument, ctx.data))

const AssignableAssistantsDocument = graphql(`
  query getAssignableAssistants($ownerId: String!) {
    aiAssistants(ownerId: $ownerId) {
      ...NewConversationSelector_Assistant
      ...ConversationParticipants_Assistant
      ...ParticipantsDialog_Assistant
    }
  }
`)

export const getAssignableAssistants = createServerFn({ method: 'GET' })
  .validator((data: { ownerId: string }) => z.object({ ownerId: z.string() }).parse(data))
  .handler(async (ctx) => backendRequest(AssignableAssistantsDocument, ctx.data))

export const Route = createFileRoute('/_authenticated/conversations/$')({
  component: RouteComponent,
  beforeLoad: async ({ params }) => {
    return {
      selectedConversationId: params._splat as string,
    }
  },
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const userId = user.id
  const navigate = useNavigate()
  const { _splat } = useParams({ strict: false })
  const selectedConversationId = _splat as string
  const drawerCheckboxRef = useRef<HTMLInputElement>(null)

  const { data: profile } = useQuery(getProfileQueryOptions(userId))

  const { data: conversations, isLoading: conversationsLoading } = useSuspenseQuery({
    queryKey: [queryKeys.Conversations, userId],
    queryFn: () => getConversations({ data: { userId } }),
  })

  const handleConversationClick = () => {
    if (drawerCheckboxRef.current) {
      drawerCheckboxRef.current.checked = false
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
    queryFn: () => getAssignableHumans({ data: { userId } }),
  })

  const { data: assignableAssistants, isLoading: assignableAssistantsIsLoading } = useSuspenseQuery({
    queryKey: [queryKeys.ConversationAssignableAssistants, userId],
    queryFn: () => getAssignableAssistants({ data: { ownerId: userId } }),
  })

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
    <div className="drawer grow lg:drawer-open lg:-mt-4">
      <input id="conversation-drawer" type="checkbox" className="drawer-toggle" ref={drawerCheckboxRef} />
      <div className="drawer-content flex flex-col">
        <div className="sticky top-[72px] z-30 mt-[-16px] flex flex-row items-center justify-between bg-base-100 p-1 pt-2 lg:top-0 lg:mt-0">
          <div className="flex">
            <label htmlFor="conversation-drawer" className="btn drawer-button btn-sm mx-1 lg:hidden">
              <MenuIcon className="size-6" />
            </label>
            <div className="lg:hidden">
              <NewConversationSelector
                humans={assignableUsers.myConversationUsers}
                assistants={assignableAssistants.aiAssistants}
                userId={userId}
              />
            </div>
          </div>

          {selectedConversation?.aiConversation && (
            <div className="flex lg:hidden">
              <ParticipantsDialog
                conversation={selectedConversation.aiConversation}
                assistants={assignableAssistants.aiAssistants}
                humans={assignableUsers.myConversationUsers}
                dialogMode="add"
                userId={userId}
              />
              <DeleteLeaveConversationDialog conversation={selectedConversation.aiConversation} userId={userId} />
            </div>
          )}
        </div>

        <div className="flex h-full flex-col">
          {selectedConversation?.aiConversation && (
            <>
              <div className="sticky top-[116px] z-30 flex items-center justify-end bg-base-100 p-1 shadow-md lg:top-20 lg:mt-[-108px] lg:rounded-r-box">
                <ConversationParticipants
                  conversation={selectedConversation.aiConversation}
                  assistants={assignableAssistants.aiAssistants}
                  humans={assignableUsers.myConversationUsers}
                  userId={userId}
                />
                <div className="hidden lg:flex">
                  <DeleteLeaveConversationDialog conversation={selectedConversation.aiConversation} userId={userId} />
                </div>
              </div>
              <ConversationHistory conversation={selectedConversation.aiConversation} />
              <ConversationForm
                conversation={selectedConversation.aiConversation}
                user={user}
                profile={profile ?? undefined}
              />
            </>
          )}
        </div>
      </div>

      <div className="drawer-side z-50 lg:sticky lg:z-40 lg:mt-[-104px] lg:flex lg:h-screen lg:flex-col lg:pt-[76px]">
        <label htmlFor="conversation-drawer" className="drawer-overlay" />
        <div className="flex h-full w-80 flex-col items-center bg-base-200 lg:pt-2">
          <div className="sticky z-50 border-b py-2">
            <NewConversationSelector
              humans={assignableUsers.myConversationUsers}
              assistants={assignableAssistants.aiAssistants}
              isOpen={conversations?.aiConversations?.length === 0}
              userId={userId}
            />
          </div>
          <div className="flex-1 overflow-scroll px-2">
            {conversations.aiConversations && (
              <ConversationSelector
                conversations={conversations.aiConversations}
                selectedConversationId={selectedConversationId}
                onClick={handleConversationClick}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
