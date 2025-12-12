import { Link, useParams } from '@tanstack/react-router'
import { useState } from 'react'

import { dateString } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import { ConversationSelector_ConversationFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { Checkbox } from '../checkbox'
import { DeleteConversationsDialog } from './delete-conversations-dialog'

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
  onClick?: () => void
}

export const ConversationSelector = ({ conversations, onClick }: ConversationSelectorProps) => {
  const { t, language } = useTranslation()
  const [checkedConversationIds, setCheckedConversationIds] = useState<string[]>([])
  const params = useParams({ strict: false })

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

  const handleCheckConversationsOnDate = (date: keyof typeof groupedConversations) => {
    const targetedIds = groupedConversations[date].map((conversation) => conversation.id)

    setCheckedConversationIds((oldIds) => {
      if (checkedConversationIds.some((id) => targetedIds.some((targetId) => targetId === id))) {
        return oldIds.filter((id) => !targetedIds.some((targetId) => targetId === id))
      }
      return Array.from(new Set([...oldIds, ...targetedIds]))
    })
  }

  const conversationsDateChecked = (date: keyof typeof groupedConversations) => {
    const conversationsInGroup = groupedConversations[date]
    const checkedConversationsFromGroup = conversationsInGroup.filter((conversation) =>
      checkedConversationIds.some((id) => id === conversation.id),
    )

    if (checkedConversationsFromGroup.length === 0) {
      return false
    }
    if (conversationsInGroup.length === checkedConversationsFromGroup.length) {
      return true
    }
    return undefined
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="self-end">
        {params.conversationId && (
          <DeleteConversationsDialog
            checkedConversationIds={checkedConversationIds}
            resetCheckedConversationIds={() => setCheckedConversationIds([])}
            selectedConversationId={params.conversationId}
          />
        )}
      </div>
      <ul>
        {groupedConversations &&
          Object.entries(groupedConversations).map(([date, conversations]) => (
            <li key={date}>
              <div className="grid grid-cols-[1fr_8fr] items-center py-1">
                <label className="flex cursor-pointer items-center">
                  <Checkbox
                    className="checkbox-xs"
                    onChange={() => handleCheckConversationsOnDate(date)}
                    checked={conversationsDateChecked(date)}
                  />
                </label>
                <div className="p-0 text-sm font-semibold">{date}</div>
              </div>
              <ul className="m-0 mb-4">
                {conversations.map((conversation) => (
                  <li key={conversation.id} className="grid grid-cols-[1fr_8fr] items-center py-1">
                    <label className="flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        onChange={() => handleCheckConversation(conversation.id)}
                        checked={checkedConversationIds.includes(conversation.id)}
                      />
                    </label>

                    <Link
                      className="block rounded-md px-2 text-sm"
                      activeProps={{ className: 'border-2 border-info' }}
                      inactiveProps={{ className: 'border-2 border-transparent' }}
                      onClick={onClick}
                      to="/conversations/$conversationId"
                      params={{ conversationId: conversation.id }}
                    >
                      <span>{conversation.owner.name}: </span>
                      <span className="italic">
                        {conversation.assistants?.map((assistant) => assistant.name).join(', ') ||
                          t('texts.noAssistant')}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
      </ul>
    </div>
  )
}
