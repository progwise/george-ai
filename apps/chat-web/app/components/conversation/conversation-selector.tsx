import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { dateString } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import {
  ConversationSelector_ConversationFragment,
  NewConversationSelector_AssistantFragment,
  UserFragment,
} from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { DeleteConversationsDialog } from './delete-conversations-dialog'
import { NewConversationSelector } from './new-conversation-selector'

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
    }
  }
`)

interface ConversationSelectorProps {
  conversations: ConversationSelector_ConversationFragment[]
  selectedConversationId?: string
  userId: string
  onClick?: () => void
  assistants: NewConversationSelector_AssistantFragment[]
  humans: UserFragment[]
  isOpen?: boolean
}

export const ConversationSelector = ({
  conversations,
  userId,
  onClick,
  assistants: assistantsFragment,
  humans,
  selectedConversationId: selectedConversationId,
}: ConversationSelectorProps) => {
  const { t, language } = useTranslation()
  const [checkedConversationIds, setCheckedConversationIds] = useState<string[]>([])

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

  const handleCheckConversation = (conversationId: string) => {
    const isAlreadyChecked = checkedConversationIds.some((id) => id === conversationId)
    if (!isAlreadyChecked) {
      setCheckedConversationIds((prev) => [...prev, conversationId])
    } else {
      setCheckedConversationIds((arr) => arr.filter((id) => id !== conversationId))
    }
  }

  return (
    <>
      <div className="grid grid-cols-[100px_1fr]">
        <div className="flex items-center justify-center">
          <DeleteConversationsDialog
            checkedConversationIds={checkedConversationIds}
            resetCheckedConversationIds={() => setCheckedConversationIds([])}
            selectedConversationId={selectedConversationId}
          />
        </div>
        <div className="sticky z-50 border-b py-2">
          <NewConversationSelector
            users={humans}
            assistants={assistantsFragment}
            isOpen={conversations?.length === 0}
            userId={userId}
          />
        </div>
      </div>
      <ul className="menu w-72">
        {groupedConversations &&
          Object.entries(groupedConversations).map(([date, conversations]) => (
            <li key={date}>
              <div className="font-semibold">{date}</div>
              <ul>
                {conversations.map((conversation) => (
                  <li key={conversation.id} className="center grid grid-cols-[1fr_10fr] items-center">
                    <label className="mt-0.5 flex cursor-pointer items-center p-3 py-2.5">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        onChange={() => handleCheckConversation(conversation.id)}
                        checked={checkedConversationIds.includes(conversation.id)}
                      />
                    </label>

                    <Link
                      className="mt-1 block rounded-md"
                      activeProps={{ className: 'menu-active' }}
                      onClick={onClick}
                      to="/conversations/$conversationId"
                      params={{ conversationId: conversation.id }}
                    >
                      <div>
                        {conversation.owner.name} <span className="font-bold">({t('conversations.owner')})</span>
                      </div>
                      <div className="mt-1 block">
                        {conversation.assistants?.map((assistant) => assistant.name).join(', ') ||
                          t('texts.noAssistant')}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
      </ul>
    </>
  )
}
