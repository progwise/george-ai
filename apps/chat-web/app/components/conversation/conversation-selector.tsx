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
    <ul className="menu bg-base-200 rounded-box w-56">
      {/* Sidebar content here */}

      {conversations?.map((conversation) => (
        <li key={conversation.id}>
          <Link
            className={twMerge(
              'link ',
              conversation.id === selectedConversationId
                ? 'link-primary'
                : 'link-neutral',
            )}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            to={`/conversations/${conversation.id}`}
          >
            <time>{new Date(conversation.createdAt).toLocaleString()}</time>
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
