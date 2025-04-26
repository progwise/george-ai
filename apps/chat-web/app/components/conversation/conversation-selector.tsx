import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'

import { dateString } from '@george-ai/web-utils'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ClipboardIcon } from '../../icons/clipboard-icon'
import { queryKeys } from '../../query-keys'
import { useClipboard } from '../clipboard'

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
    conversationInvitation {
      id
      link
      allowMultipleParticipants
      allowDifferentEmailAddress
      confirmationDate
    }
  }
`)

interface ConversationSelectorProps {
  conversations: FragmentType<typeof ConversationSelector_ConversationFragment>[] | null
  selectedConversationId?: string
  onClick?: () => void
  userId: string
}

export const ConversationSelector = ({
  conversations: conversationsFragment,
  selectedConversationId,
  onClick,
  userId,
}: ConversationSelectorProps) => {
  const conversations = useFragment(ConversationSelector_ConversationFragment, conversationsFragment)
  const { t, language } = useTranslation()
  const { copyToClipboard } = useClipboard()
  const queryClient = useQueryClient()

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

  const handleCopyLink = (link: string | null) => {
    if (link) {
      copyToClipboard(link)
      queryClient.invalidateQueries({ queryKey: [queryKeys.ConversationInvitation, link] })
    }
  }

  return (
    <ul className="menu w-72">
      {groupedConversations &&
        Object.entries(groupedConversations).map(([date, conversations]) => (
          <li key={date}>
            <div className="font-semibold">{date}</div>
            <ul>
              {conversations.map((conversation) => (
                <li key={conversation.id} className="relative">
                  {conversation.conversationInvitation &&
                    conversation.owner.id === userId &&
                    conversation.conversationInvitation.allowDifferentEmailAddress &&
                    conversation.conversationInvitation.allowMultipleParticipants && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs tooltip tooltip-left absolute right-2 top-2"
                        onClick={() => handleCopyLink(conversation.conversationInvitation?.link ?? null)}
                        data-tip={t('tooltips.copyConversationLink')}
                      >
                        <ClipboardIcon
                          className={twMerge(
                            'text-current',
                            conversation.id === selectedConversationId ? 'text-primary-content' : '',
                          )}
                        />
                      </button>
                    )}
                  <Link
                    className={twMerge(
                      'mt-1 block rounded-md',
                      conversation.id === selectedConversationId ? 'link-primary' : 'link-neutral',
                    )}
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
