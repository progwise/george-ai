import { useMutation, useQueryClient } from '@tanstack/react-query'

import { dateTimeString } from '@george-ai/web-utils'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { sendMessage } from '../../server-functions/conversations'

const ConversationForm_ConversationFragment = graphql(`
  fragment ConversationForm_conversation on AiConversation {
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
    },
  })
  const remainingMessages = (userProfile?.freeMessages || 0) - (userProfile?.usedMessages || 0)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const content = formData.get('message') as string
    const recipientAssistantIds = Array.from(formData.getAll('assistants')).map((formData) => formData.toString())

    if (remainingMessages < 1) {
      alert('You have no more free messages left. Create your profile and ask for more...')
      return
    }
    form.reset()

    mutate({ content, recipientAssistantIds })
  }

  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()

      event.currentTarget.form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    }
  }

  if (!user) {
    return <h3>{t('texts.loginToUseSendMessages')}</h3>
  }

  return (
    <div className="bg-base-350 card border border-base-300 p-4 text-base-content shadow-md">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-content">
          {user.name?.[0] || user.username?.[0]}
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold">{user.name || user.username}</span>
          <span className="text-xs opacity-60">{dateTimeString(new Date().toISOString(), language)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-end gap-2">
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Type your message"
          rows={2}
          name="message"
          disabled={isPending}
          onKeyDown={handleTextareaKeyDown}
        ></textarea>
        <div className="flex items-center gap-2">
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

          <button name="send" type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
            Send ({remainingMessages})
          </button>
        </div>
      </form>
    </div>
  )
}
