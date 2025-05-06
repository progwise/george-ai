import { Link } from '@tanstack/react-router'

import { dateString } from '@george-ai/web-utils'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'

const ConversationSelector_ConversationFragment = graphql(`
  fragment ConversationSelector_Conversation on AiConversation {
    id
    createdAt
    owner {
      id
      name
    }
    assistants {
      id
      name
    }
  }
`)

interface ConversationSelectorProps {
  conversations: FragmentType<typeof ConversationSelector_ConversationFragment>[] | null
  onClick?: () => void
}

export const ConversationSelector = ({
  conversations: conversationsFragment,

  onClick,
}: ConversationSelectorProps) => {
  const conversations = useFragment(ConversationSelector_ConversationFragment, conversationsFragment)
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
    <ul className="menu w-72">
      {groupedConversations &&
        Object.entries(groupedConversations).map(([date, conversations]) => (
          <li key={date}>
            <div className="font-semibold">{date}</div>
            <ul>
              {conversations.map((conversation) => (
                <li key={conversation.id} className="center grid grid-cols-1">
                  <Link
                    className="mt-1 block rounded-md"
                    activeProps={{ className: 'menu-active' }}
                    onClick={onClick}
                    to="/conversations/$"
                    params={{ _splat: conversation.id }}
                  >
                    <div>
                      {conversation.owner.name} <span className="font-bold">({t('conversations.owner')})</span>
                    </div>
                    <div className="mt-1 block">
                      {conversation.assistants?.map((assistant) => assistant.name).join(', ') || t('texts.noAssistant')}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
    </ul>
  )
}
