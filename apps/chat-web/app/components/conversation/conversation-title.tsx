import { Link } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'

import { graphql } from '../../gql'
import { ConversationTitle_ConversationFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { MenuIcon } from '../../icons/menu-icon'
import { AvatarGroup } from './avatar/avatar-group'
import { LanguageModelBadge } from './language-model-badge'

graphql(`
  fragment ConversationTitle_Conversation on AiConversation {
    id
    assistants {
      id
      name
      iconUrl
      languageModel
      ...AssistantAvatar_AiAssistant
    }
    firstMessage {
      content
    }
    humans {
      ...UserAvatar_User
      id
      name
      username
    }
  }
`)

interface ConversationTitleProps {
  conversation: ConversationTitle_ConversationFragment
  userId: string
  className?: string
}

export const ConversationTitle = ({ conversation, userId, className }: ConversationTitleProps) => {
  const { t } = useTranslation()

  const models = new Set<string>(
    conversation.assistants.map((assistant) => assistant.languageModel).filter((model): model is string => !!model),
  )

  return (
    <>
      <div className={twMerge('border-base-300 bg-base-100 px-body flex items-center gap-2 border-b py-4', className)}>
        <label htmlFor="conversation-drawer" className="btn btn-sm btn-ghost lg:hidden">
          <MenuIcon className="size-6" />
        </label>

        <AvatarGroup
          maxVisible={3}
          avatars={[...conversation.assistants, ...conversation.humans.filter((human) => human.id !== userId)]}
        />

        <div className="flex flex-1 flex-col">
          {conversation.firstMessage?.content ?? (
            <span className="truncate italic">{t('conversations.historyPlaceholderShort')}</span>
          )}
          <div className="flex flex-wrap gap-2">
            {Array.from(models).map((model) => (
              <LanguageModelBadge key={model}>{model}</LanguageModelBadge>
            ))}
          </div>
        </div>

        <Link
          to="/conversations/$conversationId/settings"
          replace
          params={{ conversationId: conversation.id }}
          className="btn"
        >
          Settings
        </Link>
      </div>

      <div className="h-20" />
    </>
  )
}
