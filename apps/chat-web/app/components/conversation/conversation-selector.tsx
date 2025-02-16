import { twMerge } from 'tailwind-merge'
import { AiAssistant, AiConversation } from '../../gql/graphql'
import { Link } from '@tanstack/react-router'

interface ConversationSelectorProps {
  conversations: (Pick<AiConversation, 'id' | 'createdAt'> & {
    assistants?: Pick<AiAssistant, 'id' | 'name'>[] | null
  })[]
  selectedConversationId?: string
}

export const ConversationSelector = ({
  conversations,
  selectedConversationId,
}: ConversationSelectorProps) => {
  return (
    <ul className="menu bg-base-200 rounded-box w-72">
      {/* Sidebar content here */}

      {conversations?.map((conversation) => (
        <li key={conversation.id} className="grid center grid-cols-1">
          <Link
            className={twMerge(
              'button',
              conversation.id === selectedConversationId
                ? 'link-primary'
                : 'link-neutral',
            )}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            to={`/conversations/${conversation.id}`}
          >
            <time className="text-nowrap">
              {new Date(conversation.createdAt)
                .toLocaleString()
                .replace(',', '')}
            </time>
            <span>
              {conversation.assistants
                ?.map((assistant) => assistant.name)
                .join(',') || 'Unknown'}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
