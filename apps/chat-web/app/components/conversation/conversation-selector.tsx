import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { dateString } from '@george-ai/web-utils'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { TrashIcon } from '../../icons/trash-icon'
import { queryKeys } from '../../query-keys'
import { removeConversations } from '../../server-functions/conversations'
import { LoadingSpinner } from '../loading-spinner'
import {
  NewConversationSelector,
  NewConversationSelector_AssistantFragment,
  NewConversationSelector_HumanFragment,
} from './new-conversation-selector'

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
}: ConversationSelectorProps) => {
  const conversations = useFragment(ConversationSelector_ConversationFragment, conversationsFragment)
  const { t, language } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([])

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

  const { mutate: removeConversationsMutate, isPending: areDeletePending } = useMutation({
    mutationFn: async () => {
      return await removeConversations({
        data: { conversationIds: selectedConversationIds, userId },
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversations, userId],
      })
    },
  })

  const handleCheckConversation = (conversationId: string) => {
    const isAlreadySelected = !!selectedConversationIds.find((co) => co === conversationId)
    if (!isAlreadySelected) {
      setSelectedConversationIds((prev) => [...prev, conversationId])
    } else {
      setSelectedConversationIds((arr) => arr.filter((co) => co !== conversationId))
    }
  }

  const handleDeleteSelected = () => {
    removeConversationsMutate()
  }

  if (areDeletePending) {
    return <LoadingSpinner />
  }

  return (
    <>
      <div className="grid grid-cols-[100px_1fr]">
        <div className="flex items-center justify-center">
          <button
            type="button"
            className="btn btn-ghost lg:tooltip lg:tooltip-right"
            data-tip={t('conversations.deleteMultiple')}
            onClick={handleDeleteSelected}
          >
            <TrashIcon className="size-6" />
          </button>
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
                  <li key={conversation.id} className="center grid grid-cols-1">
                    <div className="grid grid-cols-[30px_1fr]">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        onChange={() => handleCheckConversation(conversation.id)}
                      />
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
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
      </ul>
    </>
  )
}
