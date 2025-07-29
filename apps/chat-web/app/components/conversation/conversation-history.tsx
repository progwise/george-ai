import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { graphql } from '../../gql'
import { ConversationHistory_ConversationFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { getBackendPublicUrl } from '../../server-functions/backend'
import { ConversationMessage } from './conversation-message'
import { convertMdToHtml } from './markdown-converter'

graphql(`
  fragment ConversationHistory_Conversation on AiConversation {
    ...ConversationBase
    messages {
      id
      sequenceNumber
      content
      source
      createdAt
      hidden
      sender {
        __typename
        id
        name
        isBot
        assistantId
        ... on HumanParticipant {
          user {
            avatarUrl
          }
        }
        ... on AssistantParticipant {
          assistant {
            iconUrl
            updatedAt
          }
        }
      }
    }
  }
`)

interface ConversationHistoryProps {
  conversation: ConversationHistory_ConversationFragment
  userId: string
}

interface IncomingMessage {
  id: string
  sequenceNumber: string
  content: string
  source: string
  createdAt: string
  sender: {
    id: string
    assistantId?: string
    name: string
    isBot: boolean
    userId?: string
    avatarUrl?: string | null
  }
}

export const ConversationHistory = ({ conversation, userId }: ConversationHistoryProps) => {
  const { data: backend_url } = useQuery({
    queryKey: [queryKeys.BackendUrl],
    queryFn: () => getBackendPublicUrl(),
    staleTime: Infinity,
  })
  const [newMessages, setNewMessages] = useState<IncomingMessage[]>([])
  const { t } = useTranslation()

  const messages = conversation.messages
  const selectedConversationId = conversation.id

  useEffect(() => {
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
    setNewMessages([])
  }, [messages])

  useEffect(() => {
    if (!selectedConversationId || !backend_url) {
      return
    }
    const evtSource = new EventSource(
      `${backend_url}/conversation-messages-sse?conversationId=${selectedConversationId}`,
    )

    const incomingMessages: IncomingMessage[] = []

    evtSource.onmessage = (event) => {
      const incomingMessage = JSON.parse(event.data) as IncomingMessage

      const index = incomingMessages.findIndex((message) => message.id === incomingMessage.id)

      if (index === -1) {
        incomingMessages.push(incomingMessage)
        setNewMessages((prev) =>
          [...prev, incomingMessage].sort((a, b) => {
            return BigInt(a.sequenceNumber) - BigInt(b.sequenceNumber) > 0 ? 1 : -1
          }),
        )
        return
      } else {
        incomingMessages[index].content += incomingMessage.content
      }

      const div = document.getElementById(`textarea_${incomingMessage.id}`) as HTMLDivElement
      if (div) {
        div.innerHTML = convertMdToHtml(incomingMessages[index].content)
      }
    }
    evtSource.onerror = (error) => {
      console.error('evtSource error:', error)
    }
    return () => {
      evtSource.close()
    }
  }, [backend_url, selectedConversationId])
  if (messages.length < 1 && newMessages.length < 1) {
    return (
      <div className="mt-40 flex grow flex-col justify-center gap-2 lg:mt-3">
        <div className="text-center text-sm opacity-50">{t('conversations.historyPlaceholder')}</div>
      </div>
    )
  }
  return (
    <div className="mt-2 flex grow flex-col gap-2">
      {messages.map((message) => {
        return (
          <ConversationMessage
            key={message.id}
            isLoading={false}
            userId={userId}
            conversationOwnerId={conversation.ownerId}
            message={{
              id: message.id,
              content: message.content || '',
              source: message.source,
              createdAt: message.createdAt,
              conversationId: selectedConversationId,
              hidden: message.hidden ?? false,
              sender: message.sender.isBot
                ? {
                    id: message.sender.id,
                    assistantId: message.sender.assistantId || undefined,
                    name: message.sender.name || 'Unknown',
                    isBot: true,
                    assistant:
                      message.sender.__typename === 'AssistantParticipant' && message.sender.assistant
                        ? {
                            iconUrl: message.sender.assistant.iconUrl,
                            updatedAt: message.sender.assistant.updatedAt || undefined,
                          }
                        : undefined,
                  }
                : {
                    id: message.sender.id,
                    assistantId: message.sender.assistantId || undefined,
                    name: message.sender.name || 'Unknown',
                    isBot: false,
                    user:
                      message.sender.__typename === 'HumanParticipant' && message.sender.user
                        ? {
                            avatarUrl: message.sender.user.avatarUrl,
                          }
                        : undefined,
                  },
            }}
          />
        )
      })}
      {newMessages.map((message) => (
        <ConversationMessage
          key={message.id}
          isLoading={true}
          userId={userId}
          conversationOwnerId={conversation.ownerId}
          message={{
            id: message.id,
            content: message.content,
            source: message.source,
            createdAt: message.createdAt,
            conversationId: selectedConversationId,
            hidden: false,
            sender: message.sender.isBot
              ? {
                  id: message.sender.id,
                  name: message.sender.name,
                  isBot: true,
                  assistantId: message.sender.assistantId,
                  assistant: message.sender.avatarUrl
                    ? {
                        iconUrl: message.sender.avatarUrl,
                        updatedAt: undefined,
                      }
                    : undefined,
                }
              : {
                  id: message.sender.id,
                  name: message.sender.name,
                  isBot: false,
                  assistantId: message.sender.assistantId,
                  user: message.sender.avatarUrl
                    ? {
                        avatarUrl: message.sender.avatarUrl,
                      }
                    : undefined,
                },
          }}
        />
      ))}
    </div>
  )
}
