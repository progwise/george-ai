import { Link } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'

import { FragmentType, graphql, useFragment } from '../../gql'

const ConversationSelector_ConversationsFragment = graphql(`
  fragment ConversationSelector_conversations on AiConversation {
    id
    createdAt
    assistants {
      id
      name
    }
  }
`)

interface ConversationSelectorProps {
  conversations:
    | FragmentType<typeof ConversationSelector_ConversationsFragment>[]
    | null
  selectedConversationId?: string
  onClick?: () => void
}

export const ConversationSelector = ({
  conversations: conversationsFragment,
  selectedConversationId,
  onClick,
}: ConversationSelectorProps) => {
  const conversations = useFragment(
    ConversationSelector_ConversationsFragment,
    conversationsFragment,
  )

  // Group conversations by date
  const groupedConversations = conversations?.reduce<
    Record<string, typeof conversations>
  >((accumulator, conversation) => {
    const date = new Date(conversation.createdAt).toISOString().split('T')[0]
    if (!accumulator[date]) {
      accumulator[date] = []
    }
    accumulator[date].push(conversation)
    return accumulator
  }, {})

  return (
    <ul className="menu bg-base-200 rounded-lg w-72">
      {groupedConversations &&
        Object.entries(groupedConversations).map(([date, conversations]) => (
          <li key={date} className="mb-2">
            <div className="text-gray-600 font-semibold px-3 py-1">{date}</div>
            <ul>
              {conversations.map((conversation) => (
                <li key={conversation.id} className="grid center grid-cols-1">
                  <Link
                    className={twMerge(
                      'block p-3 rounded-md',
                      conversation.id === selectedConversationId
                        ? 'link-primary'
                        : 'link-neutral',
                    )}
                    onClick={onClick}
                    to="/conversations/$"
                    params={{ _splat: conversation.id }}
                  >
                    <span className="block mt-1">
                      {conversation.assistants
                        ?.map((assistant) => assistant.name)
                        .join(', ') || 'No assistant'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
    </ul>
  )
}
