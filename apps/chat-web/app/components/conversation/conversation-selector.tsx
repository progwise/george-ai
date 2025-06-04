import React from 'react'
import { twMerge } from 'tailwind-merge'

import { dateString } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import { ConversationSelector_ConversationFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ConversationSelectorItem } from './conversation-selector-item'

graphql(`
  fragment ConversationSelector_Conversation on AiConversation {
    ...ConversationBase
    owner {
      id
      name
    }
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

interface ConversationSelectorProps {
  conversations: ConversationSelector_ConversationFragment[]
  onClick?: () => void
  onConversationSelect: (conversationId: string, checked: boolean) => void
  className?: string
}

export const ConversationSelector = ({
  conversations,
  onClick,
  onConversationSelect,
  className,
}: ConversationSelectorProps) => {
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
