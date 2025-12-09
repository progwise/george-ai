import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CollapseArrows } from '../../icons/collapse-arrows-icon'
import { ExpandArrows } from '../../icons/expand-arrows-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { backendRequest } from '../../server-functions/backend'
import { AssistantIcon } from '../assistant/assistant-icon'
import { ClientDate } from '../client-date'
import { DialogForm } from '../dialog-form'
import { FormattedMarkdown } from '../formatted-markdown'
import { toastError } from '../georgeToaster'
import { UserAvatar } from '../user-avatar'
import { getConversationQueryOptions } from './get-conversation'

const HideMessageDocument = graphql(`
  mutation hideMessage($messageId: String!) {
    hideMessage(messageId: $messageId) {
      id
      hidden
    }
  }
`)

const hideMessage = createServerFn({ method: 'POST' })
  .inputValidator((data: { messageId: string }) => z.object({ messageId: z.string() }).parse(data))
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
  .inputValidator((data: { messageId: string }) => z.object({ messageId: z.string() }).parse(data))
  .handler((ctx) =>
    backendRequest(UnhideMessageDocument, {
      messageId: ctx.data.messageId,
    }),
  )

const DeleteMessageDocument = graphql(`
  mutation deleteMessage($messageId: String!) {
    deleteMessage(messageId: $messageId) {
      id
    }
  }
`)
export const deleteMessage = createServerFn({ method: 'POST' })
  .inputValidator((data: { messageId: string }) =>
    z
      .object({
        messageId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(DeleteMessageDocument, {
      messageId: ctx.data.messageId,
    }),
  )

interface ConversationMessageProps {
  isLoading: boolean
  userId: string
  conversationOwnerId: string
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
    } & (
      | {
          isBot: false
          user?: {
            avatarUrl?: string | null
          }
        }
      | {
          isBot: true
          assistant?: {
            iconUrl?: string | null
            updatedAt?: string
          }
        }
    )
  }
}

export const ConversationMessage = ({ isLoading, message, conversationOwnerId, userId }: ConversationMessageProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const deleteDialogRef = useRef<HTMLDialogElement>(null)

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

  const { mutate: deleteMessageMutate, isPending: isDeletePending } = useMutation({
    mutationFn: async (messageId: string) => {
      await deleteMessage({ data: { messageId } })
    },
    onSettled: () => {
      queryClient.invalidateQueries(getConversationQueryOptions(message.conversationId))
    },
    onError: () => {
      toastError(t('errors.deleteMessage'))
    },
  })

  return (
    <div
      key={message.id}
      className={twMerge('card text-base-content mx-1.5 border p-3 shadow-md lg:mx-10', message.hidden && 'opacity-50')}
    >
      <div className="mb-2 flex items-center gap-2">
        {message.sender.isBot ? (
          <Link to="/assistants/$assistantId" params={{ assistantId: message.sender.assistantId! }}>
            <AssistantIcon
              assistant={{
                id: message.sender.assistantId!,
                name: message.sender.name,
                description: null,
                iconUrl: message.sender.assistant?.iconUrl || null,
                updatedAt: message.sender.assistant?.updatedAt || '',
                ownerId: '',
              }}
              className="h-8 w-8 overflow-hidden rounded-full"
            />
          </Link>
        ) : (
          <UserAvatar
            user={{
              name: message.sender.name,
              avatarUrl: message.sender.user?.avatarUrl,
            }}
            className="size-8"
          />
        )}

        <div className="flex min-w-0 grow flex-col">
          <span className="truncate text-sm font-semibold">{message.sender.name}</span>
          <ClientDate date={message.createdAt} format="dateTime" className="text-xs opacity-60" />
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
          {message.hidden ? <ExpandArrows className="size-5" /> : <CollapseArrows className="size-5" />}
        </button>
        {conversationOwnerId === userId && (
          <>
            <button
              type="button"
              className="btn btn-ghost btn-xs tooltip tooltip-left self-start"
              onClick={() => deleteDialogRef.current?.showModal()}
              data-tip={t('tooltips.deleteMessage')}
              disabled={isDeletePending}
            >
              <TrashIcon className="size-5" />
            </button>
            <DialogForm
              ref={deleteDialogRef}
              title={t('conversations.deleteMessage')}
              description={t('conversations.deleteMessageConfirmation')}
              onSubmit={() => deleteMessageMutate(message.id)}
              submitButtonText={t('actions.delete')}
            />
          </>
        )}
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
