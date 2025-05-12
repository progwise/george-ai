import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { dateTimeString } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CollapseArrows } from '../../icons/collapse-arrows-icon'
import { ExpandArrows } from '../../icons/expand-arrows-icon'
import { backendRequest } from '../../server-functions/backend'
import { getConversationQueryOptions } from '../../server-functions/conversations'
import { FormattedMarkdown } from '../formatted-markdown'

const HideMessageDocument = graphql(`
  mutation hideMessage($messageId: String!) {
    hideMessage(messageId: $messageId) {
      id
      hidden
    }
  }
`)

const hideMessage = createServerFn({ method: 'POST' })
  .validator((data: { messageId: string }) => z.object({ messageId: z.string() }).parse(data))
  .handler((ctx) =>
    backendRequest(HideMessageDocument, {
      messageId: ctx.data.messageId,
    }),
  )

const UnhideMessageDocument = graphql(`
  mutation unhideMessage($messageId: String!) {
    unhideMessage(messageId: $messageId) {
      id
      hidden
    }
  }
`)

const unhideMessage = createServerFn({ method: 'POST' })
  .validator((data: { messageId: string }) => z.object({ messageId: z.string() }).parse(data))
  .handler((ctx) =>
    backendRequest(UnhideMessageDocument, {
      messageId: ctx.data.messageId,
    }),
  )

interface ConversationMessageProps {
  isLoading: boolean
  message: {
    id: string
    content: string
    source?: string | null
    createdAt: string
    conversationId: string
    hidden: boolean
    sender: {
      id: string
      assistantId?: string
      name: string
      isBot: boolean
    }
  }
}

export const ConversationMessage = ({ isLoading, message }: ConversationMessageProps) => {
  const queryClient = useQueryClient()
  const { t, language } = useTranslation()

  const { mutate: hideMessageMutate } = useMutation({
    mutationFn: async (messageId: string) => {
      await hideMessage({ data: { messageId } })
    },
    onSettled: () => {
      queryClient.invalidateQueries(getConversationQueryOptions(message.conversationId))
    },
  })

  const { mutate: unhideMessageMutate } = useMutation({
    mutationFn: async (messageId: string) => {
      await unhideMessage({ data: { messageId } })
    },
    onSettled: () => {
      queryClient.invalidateQueries(getConversationQueryOptions(message.conversationId))
    },
  })

  const handleHideMessage = () => {
    if (message.hidden) {
      unhideMessageMutate(message.id)
    } else {
      hideMessageMutate(message.id)
    }
  }

  return (
    <div
      key={message.id}
      className={twMerge('card text-base-content mx-1.5 border p-3 shadow-md lg:mx-10', message.hidden && 'opacity-50')}
    >
      <div className="mb-2 flex items-center gap-3">
        <div
          className={twMerge(
            'flex h-8 w-8 items-center justify-center rounded-full',
            !message.sender.isBot && 'bg-primary text-primary-content',
            message.sender.isBot && 'bg-accent text-accent-content',
          )}
        >
          {message.sender.isBot ? (
            <Link to="/assistants/$assistantId" params={{ assistantId: message.sender.assistantId! }}>
              🤖
            </Link>
          ) : (
            message.sender.name?.[0].toUpperCase()
          )}
        </div>

        <div className="flex min-w-0 grow flex-col">
          <span className="truncate text-sm font-semibold">{message.sender.name}</span>
          <span className="text-xs opacity-60">{dateTimeString(message.createdAt, language)}</span>
        </div>
        {isLoading && message.sender.isBot && (
          <div>
            <span className="loading loading-dots loading-xs"></span>
          </div>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-xs lg:tooltip lg:tooltip-left ml-auto self-start"
          onClick={handleHideMessage}
          data-tip={message.hidden ? t('tooltips.unhide') : t('tooltips.hide')}
        >
          {message.hidden ? <ExpandArrows /> : <CollapseArrows />}
        </button>
      </div>
      {!message.hidden && (
        <div className="border-base-200 border-t pt-3">
          <FormattedMarkdown id={`textarea_${message.id}`} markdown={message.content} />
        </div>
      )}
      {message.source && <div className="mt-2 text-xs opacity-70">Source: {message.source}</div>}
    </div>
  )
}
