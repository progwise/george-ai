import { Fragment } from 'react/jsx-runtime'
import { AiConversationMessage } from '../../gql/graphql'

interface ConversationHistoryProps {
  messages: AiConversationMessage[]
}
export const ConversationHistory = ({ messages }: ConversationHistoryProps) => {
  return (
    <div className="chat chat-start gap-2">
      {messages.map((message) => (
        <Fragment key={message.id}>
          <div className="chat-image avatar">
            {message.sender?.name || 'Unknown'}
          </div>
          <div className="chat-bubble">{message.content}</div>
        </Fragment>
      ))}
    </div>
  )
}
