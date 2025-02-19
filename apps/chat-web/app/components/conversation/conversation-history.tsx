import { twMerge } from 'tailwind-merge'
import { FragmentType, graphql, useFragment } from '../../gql'
import { FormattedMarkdown } from '../formatted-markdown'

const ConversationHistory_ConversationFragment = graphql(`
  fragment ConversationHistory_conversation on AiConversation {
    messages {
      id
      content
      source
      createdAt
      sender {
        id
        name
        isAssistant
        isHuman
      }
    }
  }
`)

interface ConversationHistoryProps {
  conversation: FragmentType<typeof ConversationHistory_ConversationFragment>
}
export const ConversationHistory = (props: ConversationHistoryProps) => {
  const conversation = useFragment(
    ConversationHistory_ConversationFragment,
    props.conversation,
  )
  const messages = conversation.messages
  const isAssistantLoading = false
  return (
    <section className="flex flex-col gap-4">
      {messages?.map((message) => (
        <div
          key={message.id}
          className="card bg-base-350 text-base-content shadow-md border border-base-300 p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={twMerge(
                'w-8 h-8 flex items-center justify-center',
                message.sender?.isHuman &&
                  'bg-primary text-primary-content rounded-full',
                message.sender?.isAssistant &&
                  'bg-accent text-neutral-900 rounded-full',
              )}
            >
              {isAssistantLoading && (
                <>
                  <span className="loading loading-dots loading-xs"></span>
                  {message.sender.name?.charAt(0).toUpperCase()}
                </>
              )}
            </div>

            <div className="flex flex-col">
              <span className="font-semibold text-sm">
                {message.sender.name}
              </span>
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
          </div>
          <div className="border-t border-base-200 pt-3">
            {isAssistantLoading ? (
              <span className="text-sm opacity-70">
                Waiting for George AI to respond...
              </span>
            ) : (
              <FormattedMarkdown markdown={message.content} />
            )}
          </div>

          <div className="mt-2 text-xs opacity-70">
            Source: {message.source}
          </div>
        </div>
      ))}
    </section>
  )
}
