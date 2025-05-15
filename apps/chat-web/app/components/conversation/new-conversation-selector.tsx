import { graphql } from '../../gql'
import { NewConversationSelector_AssistantFragment, UserFragment } from '../../gql/graphql'
import { ConversationParticipantsDialog } from './conversation-participants-dialog'

graphql(`
  fragment NewConversationSelector_Assistant on AiAssistant {
    ...ConversationParticipantsDialog_Assistant
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
    <ConversationParticipantsDialog
      assistants={assistants}
      users={users}
      dialogMode="new"
      isOpen={isOpen}
      userId={userId}
    />
  )
}
