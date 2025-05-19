import React from 'react'
import { twMerge } from 'tailwind-merge'

import { dateString } from '@george-ai/web-utils'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ConversationSelectorItem } from './conversation-selector-item'

interface ConversationSelectorProps {
  conversations: FragmentType<typeof ConversationSelector_ConversationFragment>[]
  onClick?: () => void
  onConversationSelect: (conversationId: string, checked: boolean) => void
  className?: string
}

export const ConversationSelector_ConversationFragment = graphql(`
  fragment ConversationSelector_Conversation on AiConversation {
    id
    createdAt
    assistants {
      id
      name
      iconUrl
    }
    humans {
      name
      username
    }
    firstMessage {
      content
    }
  }
`)

export const ConversationSelector = ({
  conversations: conversationsFragment,
  onClick,
  onConversationSelect,
  className,
}: ConversationSelectorProps) => {
  const conversations = useFragment(ConversationSelector_ConversationFragment, conversationsFragment)
  const { language } = useTranslation()

  const groupedConversations = Object.groupBy(conversations, (conversation) =>
    dateString(conversation.createdAt, language),
  )

  return (
    <ul className={twMerge('menu flex-nowrap! w-72 p-0', className)}>
      {Object.entries(groupedConversations).map(([date, conversations]) => (
        <React.Fragment key={date}>
          <li className="menu-title max-w-full">{date}</li>
          {conversations?.map((conversation) => (
            <li key={conversation.id} className="max-w-full">
              <ConversationSelectorItem
                conversation={conversation}
                onClick={onClick}
                onConversationSelect={onConversationSelect}
              />
            </li>
          ))}
        </React.Fragment>
      ))}
    </ul>
  )
}
