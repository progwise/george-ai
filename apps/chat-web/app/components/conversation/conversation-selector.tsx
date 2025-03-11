import { Link } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'

import { dateString } from '@george-ai/web-utils'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'

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
  const { t, language } = useTranslation()

  // Group conversations by date
  const groupedConversations = conversations?.reduce<Record<string, typeof conversations>>(
    (accumulator, conversation) => {
      const date = dateString(conversation.createdAt, language)
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
          <li key={date} className="mb-2">
            <div className="px-3 py-1 font-semibold text-gray-600">{date}</div>
            <ul>
              {conversations.map((conversation) => (
                <li key={conversation.id} className="center grid grid-cols-1">
                  <Link
                    className={twMerge(
                      'block rounded-md p-3',
                      conversation.id === selectedConversationId ? 'link-primary' : 'link-neutral',
                    )}
                    onClick={onClick}
                    to="/conversations/$"
                    params={{ _splat: conversation.id }}
                  >
                    <span className="mt-1 block">
                      {conversation.assistants?.map((assistant) => assistant.name).join(', ') || t('texts.noAssistant')}
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
