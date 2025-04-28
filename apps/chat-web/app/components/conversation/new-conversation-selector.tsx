import { FragmentType, graphql, useFragment } from '../../gql'
import { ConversationParticipantsDialog } from './conversation-participants-dialog'

const NewConversationSelector_AssistantFragment = graphql(`
  fragment NewConversationSelector_Assistant on AiAssistant {
    ...ParticipantsDialog_Assistant
  }
`)

export const NewConversationSelector_HumanFragment = graphql(`
  fragment NewConversationSelector_Human on User {
    ...ParticipantsDialog_Human
  }
`)

interface NewConversationSelectorProps {
  assistants: FragmentType<typeof NewConversationSelector_AssistantFragment>[]
  humans: FragmentType<typeof NewConversationSelector_HumanFragment>[]
  isOpen?: boolean
  userId: string
}

export const NewConversationSelector = (props: NewConversationSelectorProps) => {
  const assistants = useFragment(NewConversationSelector_AssistantFragment, props.assistants)
  const humans = useFragment(NewConversationSelector_HumanFragment, props.humans)

  return (
    <ConversationParticipantsDialog
      assistants={assistants}
      humans={humans}
      dialogMode="new"
      isOpen={props.isOpen}
      userId={props.userId}
    />
  )
}
