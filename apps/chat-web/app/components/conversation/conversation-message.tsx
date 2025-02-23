import { twMerge } from 'tailwind-merge'
import { FormattedMarkdown } from '../formatted-markdown'

interface ConversationMessageProps {
  isLoading: boolean
  message: {
    id: string
    content: string
    source?: string | null
    createdAt: string
    sender: {
      id: string
      name: string
      isBot: boolean
    }
  }
}

export const ConversationMessage = ({
  isLoading,
  message,
}: ConversationMessageProps) => {
  return (
    <div
      key={message.id}
      className="card bg-base-350 text-base-content shadow-md border border-base-300 p-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={twMerge(
            'w-8 h-8 flex items-center justify-center rounded-full',
            !message.sender.isBot && 'bg-primary',
            message.sender.isBot && 'bg-accent',
          )}
        ></div>

        <div className="flex flex-col">
          <span className="font-semibold text-sm">{message.sender.name}</span>
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
      </div>
      <div className="border-t border-base-200 pt-3">
        {!isLoading ? (
          <FormattedMarkdown markdown={message.content} />
        ) : (
          <>
            <div id={`textarea_${message.id}`}>{message.content}</div>
          </>
        )}
      </div>

      <div className="mt-2 text-xs opacity-70">Source: {message.source}</div>
    </div>
  )
}
