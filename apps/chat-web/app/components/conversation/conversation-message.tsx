import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'

import { CrossIcon } from '../../icons/cross-icon'
import { queryKeys } from '../../query-keys'
import { hideMessage } from '../../server-functions/conversations'
import { FormattedMarkdown } from '../formatted-markdown'

interface ConversationMessageProps {
  isLoading: boolean
  message: {
    id: string
    content: string
    source?: string | null
    createdAt: string
    conversationId: string
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

  const { mutate: hideMessageMutate } = useMutation({
    mutationFn: async (messageId: string) => {
      await hideMessage({ data: { messageId } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversation, message.conversationId],
      })
    },
  })

  const handleHideMessage = () => {
    hideMessageMutate(message.id)
  }

  return (
    <div key={message.id} className="bg-base-350 card border border-base-300 p-4 text-base-content shadow-md">
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

        <div className="flex flex-col">
          <span className="text-sm font-semibold">{message.sender.name}</span>
          <span className="text-xs opacity-60">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            ·{' '}
            {new Date(message.createdAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        {isLoading && (
          <div>
            <span className="loading loading-dots loading-xs"></span>
          </div>
        )}
        <button type="button" className="btn btn-xs ml-auto self-start" onClick={handleHideMessage}>
          <CrossIcon />
        </button>
      </div>
      <div className="border-t border-base-200 pt-3">
        <FormattedMarkdown id={`textarea_${message.id}`} markdown={message.content} />
      </div>
      {message.source && <div className="mt-2 text-xs opacity-70">Source: {message.source}</div>}
    </div>
  )
}
