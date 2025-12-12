import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

import { graphql } from '../../gql'
import { ConversationForm_ConversationFragment, UserFragment, UserProfileFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ChevronDownIcon } from '../../icons/chevron-down-icon'
import { sendMessage } from '../../server-functions/conversations'
import { getProfileQueryOptions } from '../../server-functions/users'
import { ClientDate } from '../client-date'
import { DialogForm } from '../dialog-form'
import { EditableDiv } from '../editable-div'
import { toastError } from '../georgeToaster'
import { UserAvatar } from '../user-avatar'
import { getConversationQueryOptions } from './get-conversation'

graphql(`
  fragment ConversationForm_Conversation on AiConversation {
    ...ConversationBase
    assistants {
      id
      name
    }
  }
`)

interface ConversationFormProps {
  conversation: ConversationForm_ConversationFragment
  user: UserFragment
  profile?: UserProfileFragment
}
export const ConversationForm = ({ conversation, user, profile }: ConversationFormProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const errorDialogRef = useRef<HTMLDialogElement>(null)

  // store the unselected ids, so when an assistant gets added it is automatically selected
  const [unselectedAssistantIds, setUnselectedAssistantIds] = useState<string[]>([])

  const formRef = useRef<HTMLFormElement>(null)

  const remainingMessages = (profile?.freeMessages || 0) - (profile?.usedMessages || 0)

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    })
  }

  const handleScroll = () => {
    const scrollPosition = window.innerHeight + window.scrollY
    const bodyHeight = document.body.offsetHeight

    const atBottom = bodyHeight - scrollPosition < 100
    setIsAtBottom(atBottom)
  }

  useEffect(() => {
    const timeout = setTimeout(() => handleScroll(), 100)
    window.addEventListener('scroll', handleScroll)

    return () => {
      clearTimeout(timeout)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { content: string; recipientAssistantIds: string[] }) => {
      if (!data.content || data.content.trim().length < 3) {
        throw new Error(t('errors.messageTooShort'))
      }

      if (remainingMessages < 1) {
        throw new Error(t('errors.noFreeMessages'))
      }

      const result = await sendMessage({
        data: {
          conversationId: conversation.id!,
          recipientAssistantIds: data.recipientAssistantIds,
          content: data.content,
        },
      })
      return result
    },
    onSettled: () => {
      // refetch the conversation to get the new message
      queryClient.invalidateQueries(getConversationQueryOptions(conversation.id))

      queryClient.invalidateQueries(getProfileQueryOptions())

      scrollToBottom()
    },
    onError: (error) => {
      let errorMessage = t('conversations.errorProcessingMessage')
      const details = error.message

      if (error.message.includes('Unknown language model')) {
        errorMessage = t('conversations.setLLM')
      } else if (error.message.includes("This model's maximum context length")) {
        errorMessage = t('conversations.tokenLimitExceeded')
      } else if (error.message === t('errors.messageTooShort')) {
        errorMessage = t('errors.messageTooShort')
      } else if (error.message === t('errors.noFreeMessages')) {
        errorMessage = t('errors.noFreeMessages')
      }

      toastError(
        <div className="flex items-center">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => handleShowErrorDialog(details)} className="btn btn-link btn-sm">
            {t('actions.details')}
          </button>
        </div>,
      )
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    mutate({
      content: message,
      recipientAssistantIds: conversation.assistants
        .map(({ id }) => id)
        .filter((id) => !unselectedAssistantIds.includes(id)),
    })
    setMessage('')
  }

  const handleAssistantToggle = (assistantId: string) => {
    setUnselectedAssistantIds((prev) => {
      if (prev.includes(assistantId)) {
        return prev.filter((id) => id !== assistantId)
      } else {
        return [...prev, assistantId]
      }
    })
  }

  const handleSubmitMessage = () => {
    formRef.current?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  }

  const handleShowErrorDialog = (details: string) => {
    setErrorDetails(details)
    errorDialogRef.current?.showModal()
  }

  const name = user.name || user.username

  return (
    <>
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          type="button"
          className="btn sticky bottom-56 z-40 btn-circle self-center btn-sm lg:bottom-40"
          aria-label={t('actions.scrollToBottom')}
        >
          <ChevronDownIcon />
        </button>
      )}

      <div className="sticky bottom-[72px] z-30 mx-1 mt-75 rounded-box border bg-base-100 p-2 shadow-md lg:bottom-2 lg:mx-8 lg:mt-4">
        <form onSubmit={handleSubmit} className="flex flex-col" ref={formRef}>
          <EditableDiv
            className="max-h-40 min-h-12 overflow-y-auto rounded-md p-2 focus:border-primary focus:outline-hidden"
            disabled={isPending}
            onSubmit={handleSubmitMessage}
            value={message}
            onChange={setMessage}
            placeholder={t('conversations.promptPlaceholder')}
          />
          <div className="flex items-center justify-between gap-1">
            <UserAvatar user={user} className="size-8 flex-none" />

            <div className="flex grow flex-col">
              <span className="truncate text-sm font-semibold">{name}</span>
              <ClientDate date={new Date().toISOString()} format="dateTime" className="truncate text-xs opacity-60" />
            </div>

            <div className="hidden items-center gap-2 overflow-x-auto lg:flex">
              {conversation.assistants?.map((assistant) => (
                <label key={assistant.id} className="label cursor-pointer gap-2">
                  <input
                    name="assistants"
                    value={assistant.id}
                    type="checkbox"
                    checked={!unselectedAssistantIds.includes(assistant.id)}
                    onChange={() => handleAssistantToggle(assistant.id)}
                    className="checkbox checkbox-xs checkbox-info"
                  />
                  <span>{t('conversations.askAssistant').replace('{assistantName}', assistant.name)}</span>
                </label>
              ))}
            </div>

            <div className="dropdown dropdown-end dropdown-top flex-none lg:hidden">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                ...
              </div>
              <ul tabIndex={0} className="dropdown-content menu z-1 w-52 rounded-box bg-base-100 p-2 shadow-sm">
                {conversation.assistants?.map((assistant) => (
                  <li key={assistant.id}>
                    <label className="flex items-center gap-2">
                      <input
                        name="assistants"
                        value={assistant.id}
                        type="checkbox"
                        checked={!unselectedAssistantIds.includes(assistant.id)}
                        onChange={() => handleAssistantToggle(assistant.id)}
                        className="checkbox checkbox-xs checkbox-info"
                      />
                      <span>{assistant.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <button
              name="send"
              type="submit"
              className="tooltip btn tooltip-left btn-sm btn-primary"
              disabled={isPending || remainingMessages < 1}
              data-tip={`${remainingMessages} ${t('tooltips.remainingMessages')}`}
            >
              {t('actions.send')}
            </button>
          </div>
        </form>
      </div>

      <DialogForm
        ref={errorDialogRef}
        title={t('conversations.errorDetails')}
        description={<span className="overflow-x-auto break-all">{errorDetails}</span>}
        onSubmit={() => errorDialogRef.current?.close()}
        submitButtonText={t('actions.close')}
        buttonOptions="onlyClose"
      />
    </>
  )
}
