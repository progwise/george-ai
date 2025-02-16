import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useAuth } from '../../auth/auth-context'
import { LoadingSpinner } from '../../components/loading-spinner'
import {
  GetMessagesQueryOptions,
  myConversationsQueryOptions,
} from '../../server-functions/conversations'
import { myAiAssistantsQueryOptions } from '../../server-functions/assistants'
import { ConversationHistory } from '../../components/conversation/conversation-history'
import { ConversationForm } from '../../components/conversation/conversation-form'
import { useRef } from 'react'
import { ConversationSelector } from '../../components/conversation/conversation-selector'
import { NewConversationDialog } from '../../components/conversation/new-conversation-dialog'
import { myConversationUsersQueryOptions } from '../../server-functions/users'
import { AiConversation } from '../../gql/graphql'
import { ConversationParticipants } from '../../components/conversation/conversation-participants'
import { DeleteConversationDialog } from '../../components/conversation/delete-conversation-dialog'
import { CircleCrossIcon } from '../../icons/circle-cross-icon'

export const Route = createFileRoute('/conversations/$')({
  component: RouteComponent,
})

function RouteComponent() {
  const auth = useAuth()
  const navigate = useNavigate()

  const { _splat } = useParams({ strict: false })

  const selectedConversationId = _splat as string

  const { data: messagesData, isLoading: messagesLoading } = useSuspenseQuery(
    GetMessagesQueryOptions(selectedConversationId, auth.user?.id),
  )

  const { data: conversations, isLoading: conversationIsLoading } =
    useSuspenseQuery(myConversationsQueryOptions(auth.user?.id))

  const { data: assistants, isLoading: assistantsIsLoading } = useSuspenseQuery(
    myAiAssistantsQueryOptions(auth.user?.id),
  )

  const { data: users, isLoading: usersIsLoading } = useSuspenseQuery(
    myConversationUsersQueryOptions(auth.user?.id),
  )

  if (
    (conversations?.aiConversations?.length || 0) > 0 &&
    !selectedConversationId
  ) {
    navigate({ to: `/conversations/${conversations?.aiConversations?.[0].id}` })
  }

  const newDialogRef = useRef<HTMLDialogElement>(null)

  const handleNewConversation = () => {
    newDialogRef.current?.showModal()
  }

  const deleteDialogRef = useRef<HTMLDialogElement>(null)

  const handleDeleteConversation = () => {
    deleteDialogRef.current?.showModal()
  }

  const userId = auth?.user?.id
  const loadedAssistants = assistants?.aiAssistants
  const loadedUsers = users?.myConversationUsers
  const selectedConversation = conversations?.aiConversations?.find(
    (conversation) => conversation.id === selectedConversationId,
  ) as AiConversation

  return (
    <div className="flex gap-4">
      {userId && loadedAssistants && loadedUsers && (
        <NewConversationDialog
          ref={newDialogRef}
          userId={userId}
          users={loadedUsers}
          assistants={loadedAssistants}
        />
      )}

      <DeleteConversationDialog
        ref={deleteDialogRef}
        conversation={selectedConversation}
      />

      <LoadingSpinner
        isLoading={
          conversationIsLoading ||
          assistantsIsLoading ||
          usersIsLoading ||
          messagesLoading
        }
      />
      <nav>
        <div className="flex justify-between items-center p-4">
          <h3>Recent</h3>
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleNewConversation}
          >
            New
          </button>
        </div>
        <ConversationSelector
          conversations={conversations?.aiConversations || []}
          selectedConversationId={selectedConversationId}
        />
      </nav>
      <article className="flex flex-col gap-4 w-full">
        <div className="flex justify-between items-center border-b-2">
          <ConversationParticipants
            conversationId={selectedConversationId}
            participants={selectedConversation?.participants}
            assistants={loadedAssistants}
            users={loadedUsers}
          />
          <button
            type="button"
            className="btn btn-cicle btn-sm btn-ghost text-red-500"
            onClick={handleDeleteConversation}
          >
            <CircleCrossIcon /> Conversation
          </button>
        </div>
        <ConversationHistory messages={messagesData?.aiConversationMessages} />
        {selectedConversation && (
          <ConversationForm
            user={auth.user!}
            conversation={selectedConversation}
          />
        )}
      </article>
    </div>
  )
}
