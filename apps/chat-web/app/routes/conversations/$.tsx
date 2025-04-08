import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { useAuth } from '../../auth/auth-hook'
import { ConversationForm } from '../../components/conversation/conversation-form'
import { ConversationHistory } from '../../components/conversation/conversation-history'
import { ConversationParticipants } from '../../components/conversation/conversation-participants'
import { ConversationSelector } from '../../components/conversation/conversation-selector'
import { DeleteConversationDialog } from '../../components/conversation/delete-conversation-dialog'
import { NewConversationSelector } from '../../components/conversation/new-conversation-selector'
import { ParticipantsDialog } from '../../components/conversation/participants-dialog'
import { LoadingSpinner } from '../../components/loading-spinner'
import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { MenuIcon } from '../../icons/menu-icon'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

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

export const Route = createFileRoute('/conversations/$')({
  component: RouteComponent,
  beforeLoad: async ({ params }) => {
    return {
      selectedConversationId: params._splat as string,
    }
  },
})

function RouteComponent() {
  const authContext = useAuth()
  const userId = authContext.user?.id
  const navigate = useNavigate()
  const { _splat } = useParams({ strict: false })
  const selectedConversationId = _splat as string

  const { data: conversations, isLoading: conversationsLoading } = useSuspenseQuery({
    queryKey: [queryKeys.Conversations, userId],
    queryFn: async () => (userId ? await getConversations({ data: { userId } }) : null),
  })

  const { t } = useTranslation()

  const handleConversationClick = () => {
    const drawerCheckbox = document.getElementById('conversation-drawer') as HTMLInputElement
    if (drawerCheckbox && window.innerWidth < 1024) {
      drawerCheckbox.checked = false
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
    return (
      <button type="button" className="btn btn-ghost" onClick={() => authContext?.login()}>
        {t('texts.signInForConversations')}
      </button>
    )
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
    <div className="drawer lg:drawer-open lg:-mt-4">
      <input id="conversation-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <div className="sticky top-16 z-30 flex flex-row items-center justify-between bg-base-100 p-1 max-lg:pt-4">
          <div className="flex">
            <label htmlFor="conversation-drawer" className="btn drawer-button btn-sm mx-1 lg:hidden">
              <MenuIcon className="size-6" />
            </label>
            <div className="lg:hidden">
              <NewConversationSelector
                humans={assignableUsers.myConversationUsers}
                assistants={assignableAssistants.aiAssistants}
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
              />
              <DeleteConversationDialog conversation={selectedConversation.aiConversation} />
            </div>
          )}
        </div>

        <div className="flex h-full flex-col">
          {selectedConversation?.aiConversation && (
            <>
              <div className="sticky top-[116px] z-30 flex items-center justify-end bg-base-100 p-1 shadow-md lg:top-[72px] lg:rounded-r-box">
                <ConversationParticipants
                  conversation={selectedConversation.aiConversation}
                  assistants={assignableAssistants.aiAssistants}
                  humans={assignableUsers.myConversationUsers}
                />
                <div className="hidden lg:flex">
                  <DeleteConversationDialog conversation={selectedConversation.aiConversation} />
                </div>
              </div>
              <ConversationHistory conversation={selectedConversation.aiConversation} />
              <ConversationForm conversation={selectedConversation.aiConversation} />
            </>
          )}
        </div>
      </div>

      <div className="drawer-side z-50 lg:sticky lg:z-40 lg:mt-[-64px] lg:flex lg:h-screen lg:flex-col lg:pt-[64px]">
        <label htmlFor="conversation-drawer" className="drawer-overlay" />
        <div className="flex h-full w-80 flex-col items-center bg-base-200 lg:pt-2">
          <div className="sticky z-50 border-b bg-base-200 py-2">
            <NewConversationSelector
              humans={assignableUsers.myConversationUsers}
              assistants={assignableAssistants.aiAssistants}
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
