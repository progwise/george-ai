import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

import { dateTimeString } from '@george-ai/web-utils'

import { getProfileQueryOptions } from '../../auth/get-profile-query'
import { FragmentType, graphql, useFragment } from '../../gql'
import { User, UserProfile } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ChevronDownIcon } from '../../icons/chevron-down-icon'
import { queryKeys } from '../../query-keys'
import { sendMessage } from '../../server-functions/conversations'
import { EditableDiv } from '../editable-div'
import { toastError } from '../georgeToaster'

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
  user: Pick<User, 'id' | 'name' | 'username'>
  profile?: Pick<UserProfile, 'id' | 'freeMessages' | 'usedMessages'>
}
export const ConversationForm = (props: ConversationFormProps) => {
  const { t, language } = useTranslation()
  const conversation = useFragment(ConversationForm_ConversationFragment, props.conversation)
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const [isAtBottom, setIsAtBottom] = useState(true)

  // store the unselected ids, so when an assistant gets added it is automatically selected
  const [unselectedAssistantIds, setUnselectedAssistantIds] = useState<string[]>([])

  const formRef = useRef<HTMLFormElement>(null)

  const remainingMessages = (props.profile?.freeMessages || 0) - (props.profile?.usedMessages || 0)

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
      if (!data.content || data.content.trim().length < 3) {
        throw new Error('Message must be at least 3 characters')
      }

      if (remainingMessages < 1) {
        throw new Error('You have no more free messages left. Create your profile and ask for more...')
      }

      const result = await sendMessage({
        data: {
          userId: props.user.id,
          conversationId: conversation.id!,
          recipientAssistantIds: data.recipientAssistantIds,
          senderId: props.user.id,
          content: data.content,
        },
      })
      return result
    },
    onSettled: () => {
      // refetch the conversation to get the new message
      queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversation, conversation.id],
      })

      queryClient.invalidateQueries(getProfileQueryOptions(props.user.id))

      scrollToBottom()
    },
    //TODO: Handle other possible errors
    onError: () => {
      toastError(t('assistants.setLLM'))
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

  const name = props.user.name || props.user.username

  return (
    <>
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          type="button"
          className="btn btn-sm btn-circle sticky bottom-56 z-40 self-center lg:bottom-40"
          aria-label={t('actions.scrollToBottom')}
        >
          <ChevronDownIcon />
        </button>
      )}

      <div className="rounded-box bg-base-100 mt-75 sticky bottom-[72px] z-30 mx-1 border p-2 shadow-md lg:bottom-2 lg:mx-8 lg:mt-4">
        <form onSubmit={handleSubmit} className="flex flex-col" ref={formRef}>
          <EditableDiv
            className="focus:outline-hidden focus:border-primary max-h-[10rem] min-h-[3rem] overflow-y-auto rounded-md p-2"
            disabled={isPending}
            onSubmit={handleSubmitMessage}
            value={message}
            onChange={setMessage}
            placeholder={t('conversations.promptPlaceholder')}
          />
          <div className="flex items-center justify-between gap-1">
            <div className="bg-primary text-primary-content flex h-8 w-8 flex-none items-center justify-center rounded-full">
              {name[0].toUpperCase()}
            </div>

            <div className="flex grow flex-col">
              <span className="truncate text-sm font-semibold">{name}</span>
              <span className="truncate text-xs opacity-60">{dateTimeString(new Date().toISOString(), language)}</span>
            </div>

            <div className="no-scrollbar hidden items-center gap-2 overflow-x-auto lg:flex">
              {conversation.assistants?.map((assistant) => (
                <label key={assistant.id} className="label cursor-pointer gap-2">
                  <input
                    name="assistants"
                    value={assistant.id}
                    type="checkbox"
                    checked={!unselectedAssistantIds.includes(assistant.id)}
                    onChange={() => handleAssistantToggle(assistant.id)}
                    className="checkbox checkbox-info checkbox-xs"
                  />
                  <span className="label-text">
                    {t('conversations.askAssistant').replace('{assistantName}', assistant.name)}
                  </span>
                </label>
              ))}
            </div>

            <div className="dropdown dropdown-end dropdown-top flex-none lg:hidden">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                ...
              </div>
              <ul tabIndex={0} className="z-1 dropdown-content menu rounded-box bg-base-100 w-52 p-2 shadow-sm">
                {conversation.assistants?.map((assistant) => (
                  <li key={assistant.id}>
                    <label className="flex items-center gap-2">
                      <input
                        name="assistants"
                        value={assistant.id}
                        type="checkbox"
                        checked={!unselectedAssistantIds.includes(assistant.id)}
                        onChange={() => handleAssistantToggle(assistant.id)}
                        className="checkbox checkbox-info checkbox-xs"
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
              {t('actions.send')}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
