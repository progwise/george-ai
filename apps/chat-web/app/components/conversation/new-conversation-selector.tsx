import { graphql } from '../../gql'
import { NewConversationSelector_AssistantFragment, UserFragment } from '../../gql/graphql'
import { ConversationParticipantsDialogButton } from './conversation-participants-dialog-button'

graphql(`
  fragment NewConversationSelector_Assistant on AiAssistant {
    ...ConversationParticipantsDialogButton_Assistant
  }
`)

interface NewConversationSelectorProps {
  assistants: NewConversationSelector_AssistantFragment[]
  users: UserFragment[]
  isOpen?: boolean
  userId: string
}

export const NewConversationSelector = ({ assistants, users, isOpen, userId }: NewConversationSelectorProps) => {
  return (
    <ConversationParticipantsDialogButton
      assistants={assistants}
      users={users}
      dialogMode="new"
      isOpen={isOpen}
      userId={userId}
    />
  )
}
