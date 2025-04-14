import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

import { dateTimeString } from '@george-ai/web-utils'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ChevronDownIcon } from '../../icons/chevron-down-icon'
import { queryKeys } from '../../query-keys'
import { sendMessage } from '../../server-functions/conversations'

const ConversationForm_ConversationFragment = graphql(`
  fragment ConversationForm_Conversation on AiConversation {
    id
    assistants {
      id
      name
    }
  }
`)

interface ConversationFormProps {
  conversation: FragmentType<typeof ConversationForm_ConversationFragment>
}
export const ConversationForm = (props: ConversationFormProps) => {
  const { t, language } = useTranslation()
  const conversation = useFragment(ConversationForm_ConversationFragment, props.conversation)
  const queryClient = useQueryClient()
  const { user, userProfile } = useAuth()
  const editableDivRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState('')
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const form = useRef<HTMLFormElement>(null)

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY
      const bodyHeight = document.body.offsetHeight

      const atBottom = bodyHeight - scrollPosition < 100
      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setIsAtBottom(atBottom)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { content: string; recipientAssistantIds: string[] }) => {
      if (!user?.id) {
        throw new Error('User not set')
      }
      if (!data.content || data.content.trim().length < 3) {
        throw new Error('Message must be at least 3 characters')
      }
      const result = await sendMessage({
        data: {
          userId: user.id,
          conversationId: conversation.id!,
          ...data,
        },
      })
      return result
    },
    onSettled: () => {
      // refetch the conversation to get the new message
      queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversation, conversation.id],
      })

      queryClient.invalidateQueries({
        queryKey: [queryKeys.CurrentUserProfile],
      })

      scrollToBottom()
    },
  })
  const remainingMessages = (userProfile?.freeMessages || 0) - (userProfile?.usedMessages || 0)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const recipientAssistantIds = Array.from(formData.getAll('assistants')).map((formData) => formData.toString())

    if (remainingMessages < 1) {
      alert('You have no more free messages left. Create your profile and ask for more...')
      return
    }

    mutate({ content: message, recipientAssistantIds })

    if (editableDivRef.current) {
      editableDivRef.current.innerHTML = ''
      setMessage('')
      setShowPlaceholder(true)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      form.current?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    }
  }

  const handleInput = () => {
    if (editableDivRef.current) {
      const text = editableDivRef.current.innerText
      setMessage(text)
      setShowPlaceholder(text.length === 0)
    }
  }

  const handleFocus = () => {
    if (showPlaceholder) {
      setShowPlaceholder(false)
    }
  }

  const handleBlur = () => {
    if (editableDivRef.current && editableDivRef.current.innerText.trim() === '') {
      setShowPlaceholder(true)
    }
  }

  if (!user) {
    return <h3>{t('texts.loginToUseSendMessages')}</h3>
  }

  return (
    <>
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          type="button"
          className="btn btn-circle btn-sm sticky bottom-56 z-40 self-center lg:bottom-40"
          aria-label={t('actions.scrollToBottom')}
        >
          <ChevronDownIcon />
        </button>
      )}

      <div className="sticky bottom-[72px] z-30 mx-1 mt-20 rounded-box border bg-base-100 p-2 shadow-md lg:bottom-2 lg:mx-8 lg:mt-4">
        <form onSubmit={handleSubmit} className="flex flex-col" ref={form}>
          <div className="relative w-full">
            <div
              ref={editableDivRef}
              contentEditable={!isPending && 'plaintext-only'}
              className="max-h-[10rem] min-h-[3rem] overflow-y-auto rounded-md p-2 focus:border-primary focus:outline-none"
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              onFocus={handleFocus}
              onBlur={handleBlur}
              role="textbox"
              aria-multiline="true"
              aria-disabled={!!isPending}
            ></div>
            {showPlaceholder && (
              <div className="pointer-events-none absolute left-2 top-2 text-base-content opacity-50">
                {t('conversations.promptPlaceholder')}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-1">
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary text-primary-content">
              {(user.name?.[0] || user.username?.[0])?.toUpperCase()}
            </div>

            <div className="flex min-w-0 grow flex-col">
              <span className="truncate text-sm font-semibold">{user.name || user.username}</span>
              <span className="text-xs opacity-60">{dateTimeString(new Date().toISOString(), language)}</span>
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              {conversation.assistants?.map((assistant) => (
                <label key={assistant.id} className="label cursor-pointer gap-2">
                  <input
                    name="assistants"
                    value={assistant.id}
                    type="checkbox"
                    defaultChecked
                    className="checkbox-info checkbox checkbox-sm"
                  />
                  <span className="label-text">
                    {t('conversations.askAssistant').replace('{assistantName}', assistant.name)}
                  </span>
                </label>
              ))}
            </div>

            <div className="dropdown dropdown-end dropdown-top flex-none lg:hidden">
              <div tabIndex={0} role="button" className="btn btn-ghost">
                ...
              </div>
              <ul tabIndex={0} className="z-1 menu dropdown-content w-52 rounded-box bg-base-100 p-2 shadow">
                {conversation.assistants?.map((assistant) => (
                  <li key={assistant.id}>
                    <label className="flex items-center gap-2">
                      <input
                        name="assistants"
                        value={assistant.id}
                        type="checkbox"
                        defaultChecked
                        className="checkbox-info checkbox checkbox-sm"
                      />
                      <span className="label-text">{assistant.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <button
              name="send"
              type="submit"
              className="btn btn-primary btn-sm tooltip tooltip-left"
              disabled={isPending || remainingMessages < 1}
              data-tip={`${remainingMessages} ${t('tooltips.remainingMessages')}`}
            >
              {t('actions.sendMessage')}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
