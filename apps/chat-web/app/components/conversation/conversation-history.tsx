import { Fragment } from 'react/jsx-runtime'
import { FragmentType, graphql, useFragment } from '../../gql'

const ConversationHistory_ConversationFragment = graphql(`
  fragment ConversationHistory_conversation on AiConversation {
    messages {
      id
      content
      sender {
        id
        name
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
  return (
    <div className="chat chat-start gap-2">
      {messages?.map((message) => (
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
