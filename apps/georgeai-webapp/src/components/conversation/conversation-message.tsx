import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { dateTimeString } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CollapseArrows } from '../../icons/collapse-arrows-icon'
import { ExpandArrows } from '../../icons/expand-arrows-icon'
import { PencilIcon } from '../../icons/pencil-icon'
import { ThumbsDownIcon } from '../../icons/thumbs-down-icon'
import { ThumbsUpIcon } from '../../icons/thumbs-up-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { backendRequest } from '../../server-functions/backend'
import { AssistantIcon } from '../assistant/assistant-icon'
import { DialogForm } from '../dialog-form'
import { FormattedMarkdown } from '../formatted-markdown'
import { toastError, toastSuccess } from '../georgeToaster'
import { UserAvatar } from '../user-avatar'
import { CreateFeedbackDialog, CreateFeedbackFormInput } from './create-feedback-dialog'
import { EditAnswerSuggestionDialog, EditFeedbackSuggestionFormInput } from './edit-answer-suggestion-dialog'
import { EditFeedbackDialog, EditFeedbackFormInput } from './edit-feedback-dialog'
import { getConversationQueryOptions } from './get-conversation'

const getCreateFeedbackFormSchema = () =>
  z.object({
    originalContext: z.string().nonempty(),
    originalAnswer: z.string().nonempty(),
    feedback: z.enum(['positive', 'negative']),
    answerMessageId: z.string().nonempty(),
    languageModel: z.string().optional(),
    answerAssistantId: z.string().optional(),
    answerUserId: z.string().optional(),
    feedbackSuggestion: z.string().optional(),
  })

const getUpdateFeedbackFormSchema = () =>
  z.object({
    id: z.string().nonempty(),
    feedback: z.enum(['positive', 'negative']),
    feedbackSuggestion: z.string().optional(),
  })

const getUpdateFeedbackSuggestionFormSchema = () =>
  z.object({
    id: z.string().nonempty(),
    feedbackSuggestion: z.string().optional(),
  })

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

const CreateFeedbackDocument = graphql(`
  mutation createConversationFeedback($data: ConversationFeedbackCreateInput!) {
    createConversationFeedback(data: $data) {
      id
    }
  }
`)

export const createFeedback = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateFeedbackFormInput) => {
    return getCreateFeedbackFormSchema().parse(data)
  })
  .handler(async (ctx) => {
    const data = ctx.data
    const result = await backendRequest(CreateFeedbackDocument, {
      data: data,
    })
    return result
  })

const UpdateFeedbackDocument = graphql(`
  mutation updateConversationFeedback($id: String!, $data: ConversationFeedbackUpdateInput!) {
    updateConversationFeedback(id: $id, data: $data) {
      id
    }
  }
`)

export const updateFeedback = createServerFn({ method: 'POST' })
  .inputValidator((data: EditFeedbackFormInput) => {
    return getUpdateFeedbackFormSchema().parse(data)
  })
  .handler(async (ctx) => {
    const data = ctx.data
    const result = await backendRequest(UpdateFeedbackDocument, {
      id: data.id,
      data: {
        feedback: data.feedback,
        feedbackSuggestion: data.feedbackSuggestion,
      },
    })
    return result
  })

const DeleteFeedbackDocument = graphql(`
  mutation deleteConversationFeedback($id: String!) {
    deleteConversationFeedback(id: $id) {
      id
    }
  }
`)

export const deleteFeedback = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) =>
    z
      .object({
        id: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    const result = await backendRequest(DeleteFeedbackDocument, {
      id: ctx.data.id,
    })
    return result
  })

const ChangeFeedbackSuggestionDocument = graphql(`
  mutation changeConversationFeedbackSuggestion($id: String!, $data: ConversationFeedbackSuggestionInput!) {
    changeConversationFeedbackSuggestion(id: $id, data: $data) {
      id
    }
  }
`)

export const changeFeedbackSuggestion = createServerFn({ method: 'POST' })
  .inputValidator((data: EditFeedbackSuggestionFormInput) => {
    return getUpdateFeedbackSuggestionFormSchema().parse(data)
  })
  .handler(async (ctx) => {
    const data = ctx.data
    const result = await backendRequest(ChangeFeedbackSuggestionDocument, {
      id: data.id,
      data: {
        feedbackSuggestion: data.feedbackSuggestion,
      },
    })
    return result
  })

export const deleteFeedbackSuggestion = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) =>
    z
      .object({
        id: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    const data = ctx.data
    const result = await backendRequest(ChangeFeedbackSuggestionDocument, {
      id: data.id,
      data: {
        feedbackSuggestion: '',
      },
    })
    return result
  })

export interface Message {
  id: string
  sequenceNumber: string
  content: string
  source?: string | null
  createdAt: string
  conversationId: string
  hidden: boolean
  feedback?:
    | {
        id: string
        feedback?: string | null | undefined
        feedbackUserId?: string | null | undefined
        feedbackSuggestion?: string | null | undefined
      }
    | null
    | undefined
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
          id?: string | null
        }
      }
    | {
        isBot: true
        assistant?: {
          iconUrl?: string | null
          updatedAt?: string
          languageModel?: string | null | undefined
        }
      }
  )
}

interface ConversationMessageProps {
  isLoading: boolean
  userId: string
  conversationOwnerId: string
  isFirstMessage: boolean
  message: Message
  messageContext?: string
}

export const ConversationMessage = ({
  isLoading,
  message,
  conversationOwnerId,
  userId,
  isFirstMessage,
  messageContext,
}: ConversationMessageProps) => {
  const queryClient = useQueryClient()
  const { t, language } = useTranslation()
  const deleteDialogRef = useRef<HTMLDialogElement>(null)
  const createFeedbackDialogRef = useRef<HTMLDialogElement>(null)
  const editFeedbackDialogRef = useRef<HTMLDialogElement>(null)
  const deleteAnswerSuggestionDialogRef = useRef<HTMLDialogElement>(null)
  const [feedback, setFeedback] = useState<{ feedback: 'positive' | 'negative' | undefined }>({ feedback: undefined })

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

  const { mutate: createFeedbackMutate } = useMutation({
    mutationFn: (data: CreateFeedbackFormInput) => createFeedback({ data }),
    onSettled: () => {
      queryClient.invalidateQueries(getConversationQueryOptions(message.conversationId))
    },
    onError: () => {
      toastError(t('errors.createFeedback'))
    },
    onSuccess: () => {
      toastSuccess(t('notifications.feedbackCreated'))
    },
  })

  const { mutate: updateFeedbackMutate } = useMutation({
    mutationFn: (data: EditFeedbackFormInput) => updateFeedback({ data }),
    onSettled: () => {
      queryClient.invalidateQueries(getConversationQueryOptions(message.conversationId))
    },
    onError: () => {
      toastError(t('errors.updateFeedback'))
    },
    onSuccess: () => {
      toastSuccess(t('notifications.feedbackChanged'))
    },
  })

  const { mutate: deleteFeedbackMutate } = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteFeedback({ data: { id } })
      return result
    },
    onSettled: () => {
      queryClient.invalidateQueries(getConversationQueryOptions(message.conversationId))
    },
    onError: () => {
      toastError(t('errors.deleteFeedback'))
    },
    onSuccess: () => {
      toastSuccess(t('notifications.feedbackDeleted'))
    },
  })

  const { mutate: changeFeedbackSuggestionMutate } = useMutation({
    mutationFn: async (data: EditFeedbackSuggestionFormInput) => {
      const result = await changeFeedbackSuggestion({ data })
      return result
    },
    onSettled: () => {
      queryClient.invalidateQueries(getConversationQueryOptions(message.conversationId))
    },
    onError: () => {
      toastError(t('errors.changeFeedbackSuggestion'))
    },
    onSuccess: () => {
      toastSuccess(t('notifications.feedbackChanged'))
    },
  })

  const { mutate: deleteFeedbackSuggestionMutate } = useMutation({
    mutationFn: async (feedbackId: string) => {
      const result = await deleteFeedbackSuggestion({ data: { id: feedbackId } })
      return result
    },
    onSettled: () => {
      queryClient.invalidateQueries(getConversationQueryOptions(message.conversationId))
    },
    onError: () => {
      toastError(t('errors.deleteFeedbackSuggestion'))
    },
    onSuccess: () => {
      toastSuccess(t('notifications.feedbackChanged'))
    },
  })

  const handleClickFeedbackButton = (feedbackKind: 'positive' | 'negative') => {
    if (message.feedback?.feedback === feedbackKind) {
      handleEditFeedback()
    } else {
      setFeedback({ feedback: feedbackKind })
      createFeedbackDialogRef.current?.showModal()
    }
  }

  const handleClickOnSuggestionButton = () => {
    handleDeleteAnswerSuggestion()
  }

  const handleDeleteAnswerSuggestion = () => {
    deleteAnswerSuggestionDialogRef.current?.showModal()
  }

  const handleEditFeedback = () => {
    editFeedbackDialogRef.current?.showModal()
  }

  const onSubmitFeedbackCreation = (data: CreateFeedbackFormInput) => {
    createFeedbackMutate(data)
  }

  return (
    <>
      <div
        key={message.id}
        className={twMerge(
          'card text-base-content mx-1.5 border p-3 shadow-md lg:mx-10',
          message.hidden && 'opacity-50',
        )}
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
          <>
            <div className="border-base-200 border-t pt-3">
              <FormattedMarkdown id={`textarea_${message.id}`} markdown={message.content} />
            </div>
            {!isFirstMessage && (
              <div className="flex justify-end gap-2">
                <div>
                  <button
                    type="button"
                    className={twMerge(
                      'btn btn-circle btn-ghost btn-sm hover:bg-base-400 ms-1 rounded-full focus:outline-none',
                      !message.feedback?.feedbackSuggestion && 'invisible',
                    )}
                    onClick={handleClickOnSuggestionButton}
                    data-tip={t('tooltips.edit')}
                  >
                    <PencilIcon className={twMerge('size-5', message.feedback?.feedback && 'text-primary')} />
                  </button>
                  {message.feedback?.feedbackSuggestion && (
                    <EditAnswerSuggestionDialog
                      ref={deleteAnswerSuggestionDialogRef}
                      message={message}
                      onSubmit={changeFeedbackSuggestionMutate}
                      onDeleteButtonClick={deleteFeedbackSuggestionMutate}
                    />
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    className={twMerge(
                      'btn btn-circle btn-ghost btn-sm hover:bg-base-400 ms-1 rounded-full focus:outline-none',
                      (message.feedback?.feedback === 'negative' ||
                        (!message.sender.isBot && message.sender.user?.id === userId)) &&
                        'invisible',
                    )}
                    onClick={() => handleClickFeedbackButton('positive')}
                    data-tip={
                      message.feedback?.feedback === 'negative' ? t('tooltips.givePositiveFeedback') : undefined
                    }
                  >
                    <ThumbsUpIcon className={twMerge('size-5', message.feedback?.feedback && 'text-primary')} />
                  </button>
                  <button
                    type="button"
                    className={twMerge(
                      'btn btn-circle btn-ghost btn-sm hover:bg-base-400 ms-1 rounded-full focus:outline-none',
                      (message.feedback?.feedback === 'positive' ||
                        (!message.sender.isBot && message.sender.user?.id === userId)) &&
                        'invisible',
                    )}
                    onClick={() => handleClickFeedbackButton('negative')}
                    data-tip={
                      message.feedback?.feedback === 'positive' ? t('tooltips.givePositiveFeedback') : undefined
                    }
                  >
                    <ThumbsDownIcon className={twMerge('size-5', message.feedback?.feedback && 'text-primary')} />
                  </button>
                  {!message.feedback && (
                    <CreateFeedbackDialog
                      ref={createFeedbackDialogRef}
                      feedback={feedback}
                      message={message}
                      onSubmit={onSubmitFeedbackCreation}
                      messageContext={messageContext || ''}
                    />
                  )}
                  {message.feedback && (
                    <EditFeedbackDialog
                      ref={editFeedbackDialogRef}
                      message={message}
                      onSubmit={updateFeedbackMutate}
                      onDeleteButtonClick={deleteFeedbackMutate}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
        {message.source && <div className="mt-2 text-xs opacity-70">Source: {message.source}</div>}
      </div>
    </>
  )
}
