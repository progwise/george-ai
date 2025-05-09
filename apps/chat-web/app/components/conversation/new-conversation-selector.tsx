import { FragmentType, graphql, useFragment } from '../../gql'
import { User } from '../../server-functions/users'
import { ConversationParticipantsDialog } from './conversation-participants-dialog'

export const NewConversationSelector_AssistantFragment = graphql(`
  fragment NewConversationSelector_Assistant on AiAssistant {
    ...ConversationParticipantsDialog_Assistant
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
    <ConversationParticipantsDialog
      assistants={assistants}
      users={users}
      dialogMode="new"
      isOpen={props.isOpen}
      userId={props.userId}
    />
  )
}
