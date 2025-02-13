import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useAuth } from '../../auth/auth-context'
import { LoadingSpinner } from '../../components/loading-spinner'
import { ConversationAssistantSelector } from '../../components/conversation/conversation-assistant-selector'
import {
  AiAssistant,
  AiAssistantType,
  AiConversationMessage,
} from '../../gql/graphql'
import {
  GetMessagesQueryOptions,
  myConversationsQueryOptions,
} from '../../server-functions/conversations'
import { myAiAssistantsQueryOptions } from '../../server-functions/assistants'
import { ConversationHistory } from '../../components/conversation/conversation-history'
import { ConversationForm } from '../../components/conversation/conversation-form'
import { useState } from 'react'
import { ConversationSelector } from '../../components/conversation/conversation-selector'

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

  const [selectedAssistant, setSelectedAssistant] = useState<AiAssistant>({
    id: '',
    name: '',
    description: '',
    icon: '',
    createdAt: '',
    ownerId: '',
    assistantType: AiAssistantType.Chatbot,
    url: '',
  })

  const { data: conversations, isLoading: conversationIsLoading } =
    useSuspenseQuery(myConversationsQueryOptions(auth.user?.id))

  const { data: assistants, isLoading: assistantsIsLoading } = useSuspenseQuery(
    myAiAssistantsQueryOptions(auth.user?.id),
  )

  if (
    (conversations?.aiConversations?.length || 0) > 0 &&
    !selectedConversationId
  ) {
    navigate({ to: `/conversations/${conversations?.aiConversations?.[0].id}` })
  }

  const handleNewConversation = () => {}

  return (
    <div className="flex gap-4">
      <LoadingSpinner
        isLoading={
          conversationIsLoading || assistantsIsLoading || messagesLoading
        }
      />
      <nav className="card">
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
        <ConversationAssistantSelector
          assistants={assistants?.aiAssistants || []}
          selectedAssistant={selectedAssistant}
          onChange={(assistant: AiAssistant) => {
            setSelectedAssistant(assistant)
          }}
        />
        <ConversationHistory
          messages={
            messagesData?.aiConversationMessages as AiConversationMessage[]
          }
        />
        <ConversationForm
          user={auth.user!}
          conversationId={selectedConversationId}
        />
      </article>
    </div>
  )
}
