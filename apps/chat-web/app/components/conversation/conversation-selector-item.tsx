import { Link } from '@tanstack/react-router'

import { ConversationSelector_ConversationFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { AssistantAvatar } from './avatar/assistant-avatar'

interface ConversationSelectorItemProps {
  conversation: ConversationSelector_ConversationFragment
  onClick?: () => void
  onConversationSelect: (conversationId: string, checked: boolean) => void
}

export const ConversationSelectorItem = ({
  conversation,
  onClick,
  onConversationSelect,
}: ConversationSelectorItemProps) => {
  const { t } = useTranslation()

  const firstAssistant = conversation.assistants.at(0)
  const firstMessageText = conversation.firstMessage?.content

  const allNames: string[] = [
    ...conversation.assistants.map((assistant) => assistant.name),
    ...conversation.humans.map((human) => human.name ?? human.username),
  ]

  return (
    <Link
      className="flex max-w-full items-center gap-2"
      activeProps={{ className: 'menu-active' }}
      onClick={onClick}
      to="/conversations/$conversationId"
      params={{ conversationId: conversation.id }}
    >
      {firstAssistant && <AssistantAvatar assistant={firstAssistant} hideLink />}
      <div className="flex min-w-0 flex-1 shrink flex-col">
        <span className="truncate">
          {firstMessageText ?? <span className="italic">{t('conversations.historyPlaceholderShort')}</span>}
        </span>

        <span className="truncate text-xs font-light">{allNames.join(' • ')}</span>
      </div>
      <input
        type="checkbox"
        className="checkbox checkbox-xs bg-base-200!"
        onChange={(e) => onConversationSelect(conversation.id, e.target.checked)}
        onClick={(e) => e.stopPropagation()}
      />
    </Link>
  )
}
