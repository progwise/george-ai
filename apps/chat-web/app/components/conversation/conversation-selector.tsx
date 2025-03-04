import { twMerge } from 'tailwind-merge'
import { Link } from '@tanstack/react-router'
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
  onConversationClick: (conversationId: string) => void
}

export const ConversationSelector = (props: ConversationSelectorProps) => {
  const { selectedConversationId, onConversationClick } = props
  const conversations = useFragment(
    ConversationSelector_ConversationsFragment,
    props.conversations,
  )

  return (
    <ul className="menu bg-base-200 rounded-lg w-72">
      {conversations?.map((conversation) => (
        <li key={conversation.id} className="grid center grid-cols-1">
          <Link
            className={twMerge(
              'block p-3 rounded-md',
              conversation.id === selectedConversationId
                ? 'link-primary'
                : 'link-neutral',
            )}
            onClick={() => onConversationClick(conversation.id)}
            to="/conversations/$"
            params={{ _splat: conversation.id }}
          >
            <time className="text-nowrap text-gray-500">
              {new Date(conversation.createdAt).toISOString().split('T')[0]}
            </time>
            <span className="block mt-1">
              {conversation.assistants
                ?.map((assistant) => assistant.name)
                .join(', ')}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
