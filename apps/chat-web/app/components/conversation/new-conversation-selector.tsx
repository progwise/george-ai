import { FragmentType, graphql, useFragment } from '../../gql'
import { User } from '../../server-functions/users'
import { ConversationParticipantsDialogButton } from './conversation-participants-dialog-button'

export const NewConversationSelector_AssistantFragment = graphql(`
  fragment NewConversationSelector_Assistant on AiAssistant {
    ...ConversationParticipantsDialogButton_Assistant
  }
`)

interface NewConversationSelectorProps {
  assistants: FragmentType<typeof NewConversationSelector_AssistantFragment>[]
  users: User[]
  isOpen?: boolean
  userId: string
}

export const NewConversationSelector = (props: NewConversationSelectorProps) => {
  const assistants = useFragment(NewConversationSelector_AssistantFragment, props.assistants)
  const { users } = props

  return (
    <ConversationParticipantsDialogButton
      assistants={assistants}
      users={users}
      dialogMode="new"
      isOpen={props.isOpen}
      userId={props.userId}
    />
  )
}
