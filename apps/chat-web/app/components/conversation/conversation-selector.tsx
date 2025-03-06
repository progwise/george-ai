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
  conversations: FragmentType<typeof ConversationSelector_ConversationsFragment>[] | null
  selectedConversationId?: string
  onClick?: () => void
}

export const ConversationSelector = ({
  conversations: conversationsFragment,
  selectedConversationId,
  onClick,
}: ConversationSelectorProps) => {
  const conversations = useFragment(ConversationSelector_ConversationsFragment, conversationsFragment)

  // Group conversations by date
  const groupedConversations = conversations?.reduce<Record<string, typeof conversations>>(
    (accumulator, conversation) => {
      const date = new Date(conversation.createdAt).toISOString().split('T')[0]
      if (!accumulator[date]) {
        accumulator[date] = []
      }
      accumulator[date].push(conversation)
      return accumulator
    },
    {},
  )

  return (
    <ul className="menu w-72 rounded-lg bg-base-200">
      {groupedConversations &&
        Object.entries(groupedConversations).map(([date, conversations]) => (
          <li key={date}>
            <div className="font-semibold">{date}</div>
            <ul>
              {conversations.map((conversation) => (
                <li key={conversation.id} className="center grid grid-cols-1">
                  <Link
                    className={twMerge(
                      'mt-1 block rounded-md',
                      conversation.id === selectedConversationId ? 'link-primary' : 'link-neutral',
                    )}
                    onClick={onClick}
                    to="/conversations/$"
                    params={{ _splat: conversation.id }}
                  >
                    <span>
                      {conversation.assistants?.map((assistant) => assistant.name).join(', ') || 'No assistant'}
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
