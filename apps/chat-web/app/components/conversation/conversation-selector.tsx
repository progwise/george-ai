import { Link } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'

import { dateString } from '@george-ai/web-utils'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ClipboardIcon } from '../../icons/clipboard-icon'
import { useClipboard } from '../useClipboard'

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
      isUsed
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
                <li key={conversation.id}>
                  <Link
                    className={twMerge(
                      'mt-1 block rounded-md',
                      conversation.id === selectedConversationId ? 'link-primary' : 'link-neutral',
                    )}
                    onClick={onClick}
                    to="/conversations/$"
                    params={{ _splat: conversation.id }}
                  >
                    <div className="flex justify-between">
                      <div>
                        {conversation.owner.name} <span className="font-bold">({t('conversations.owner')})</span>
                      </div>
                      {conversation.conversationInvitation &&
                        conversation.owner.id === userId &&
                        conversation.conversationInvitation.allowMultipleParticipants && (
                          <button
                            type="button"
                            className="btn btn-square btn-ghost btn-xs tooltip tooltip-left"
                            data-tip={t('tooltips.copyInvitationLink')}
                            onClick={() => {
                              if (conversation.conversationInvitation?.link) {
                                copyToClipboard(conversation.conversationInvitation.link)
                              }
                            }}
                          >
                            <ClipboardIcon />
                          </button>
                        )}
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
