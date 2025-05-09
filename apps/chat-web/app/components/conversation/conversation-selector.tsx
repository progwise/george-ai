import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { dateString } from '@george-ai/web-utils'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import {
  NewConversationSelector,
  NewConversationSelector_AssistantFragment,
  NewConversationSelector_HumanFragment,
} from './new-conversation-selector'
import { RemoveConversationsDialog } from './remove-conversations-dialog'

export const ConversationSelector_ConversationFragment = graphql(`
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
  selectedConversationId?: string
  userId: string
  onClick?: () => void
  assistants: FragmentType<typeof NewConversationSelector_AssistantFragment>[]
  humans: FragmentType<typeof NewConversationSelector_HumanFragment>[]
  isOpen?: boolean
}

export const ConversationSelector = ({
  conversations: conversationsFragment,
  userId,
  onClick,
  assistants: assistantsFragment,
  humans: humansFragment,
  selectedConversationId: selectedConversationId,
}: ConversationSelectorProps) => {
  const conversations = useFragment(ConversationSelector_ConversationFragment, conversationsFragment)
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
          <RemoveConversationsDialog
            conversations={conversationsFragment}
            checkedConversationIds={checkedConversationIds}
            userId={userId}
            resetCheckedConversationIds={() => setCheckedConversationIds([])}
            selectedConversationId={selectedConversationId}
          />
        </div>
        <div className="sticky z-50 border-b py-2">
          <NewConversationSelector
            humans={humansFragment}
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
                    <div>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        onChange={() => handleCheckConversation(conversation.id)}
                      />
                    </div>
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
