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
}

export const ConversationSelector = (props: ConversationSelectorProps) => {
  const { selectedConversationId } = props
  const conversations = useFragment(
    ConversationSelector_ConversationsFragment,
    props.conversations,
  )
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
