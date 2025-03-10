import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { FragmentType, graphql, useFragment } from '../../gql'
import { queryKeys } from '../../query-keys'
import { getBackendPublicUrl } from '../../server-functions/backend'
import { ConversationMessage } from './conversation-message'
import { convertMdToHtml } from './markdown-converter'

const ConversationHistory_ConversationFragment = graphql(`
  fragment ConversationHistory_conversation on AiConversation {
    id
    messages {
      id
      sequenceNumber
      content
      source
      createdAt
      hidden
      sender {
        id
        name
        isBot
        assistantId
      }
    }
  }
`)

interface ConversationHistoryProps {
  conversation: FragmentType<typeof ConversationHistory_ConversationFragment>
}

interface IncomingMessage {
  id: string
  sequenceNumber: string
  content: string
  source: string
  createdAt: string
  hidden: boolean
  sender: {
    id: string
    assistantId?: string
    name: string
    isBot: boolean
  }
}

export const ConversationHistory = (props: ConversationHistoryProps) => {
  const { data: backend_url } = useQuery({
    queryKey: [queryKeys.BackendUrl],
    queryFn: async () => {
      const backendUrl = await getBackendPublicUrl()
      return backendUrl
    },
    staleTime: Infinity,
  })
  const conversation = useFragment(ConversationHistory_ConversationFragment, props.conversation)
  const [newMessages, setNewMessages] = useState<IncomingMessage[]>([])
  const messages = conversation.messages
  const isAssistantLoading = false
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
          [...prev, incomingMessage]
            .filter((message) => !message.hidden)
            .sort((a, b) => {
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

  return (
    <section className="flex flex-col gap-4">
      {messages.map((message) => (
        <ConversationMessage
          key={message.id}
          isLoading={isAssistantLoading}
          message={{
            id: message.id,
            content: message.content || '',
            source: message.source,
            createdAt: message.createdAt,
            conversationId: selectedConversationId,
            hidden: message.hidden ?? false,
            sender: {
              id: message.sender.id,
              assistantId: message.sender.assistantId || undefined,
              name: message.sender.name || 'Unknown',
              isBot: message.sender.isBot,
            },
          }}
        />
      ))}
      {newMessages
        .filter((message) => !message.hidden)
        .map((message) => (
          <ConversationMessage
            key={message.id}
            isLoading={true}
            message={{
              id: message.id,
              content: message.content,
              source: message.source,
              createdAt: message.createdAt,
              conversationId: selectedConversationId,
              hidden: message.hidden,
              sender: {
                id: message.sender.id,
                name: message.sender.name,
                isBot: message.sender.isBot,
                assistantId: message.sender.assistantId,
              },
            }}
          />
        ))}
    </section>
  )
}
