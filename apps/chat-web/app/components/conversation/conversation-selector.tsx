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
    <ul className="menutext-base-content menu gap-2">
      {/* Sidebar content here */}

      {conversations?.map((conversation) => (
        <li key={conversation.id}>
          <Link
            className={twMerge(
              'btn btn-sm',
              conversation.id === selectedConversationId
                ? 'btn-secondary'
                : 'btn-ghost',
            )}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            to={`/conversations/${conversation.id}`}
          >
            {' '}
            {conversation.assistants
              ?.map((assistant) => assistant.name)
              .join(',')}{' '}
            -{conversation.createdAt}
          </Link>
        </li>
      ))}
    </ul>
  )
}
