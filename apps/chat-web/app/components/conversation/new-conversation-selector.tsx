import { FragmentType, graphql, useFragment } from '../../gql'
import { ParticipantsDialog } from './participants-dialog'

const NewConversationSelector_AssistantsFragment = graphql(`
  fragment NewConversationSelector_Assistants on AiAssistant {
    ...ParticipantsDialog_Assistants
  }
`)

export const NewConversationSelector_HumansFragment = graphql(`
  fragment NewConversationSelector_Humans on User {
    ...ParticipantsDialog_Humans
  }
`)

interface NewConversationSelectorProps {
  assistants: FragmentType<typeof NewConversationSelector_AssistantsFragment>[]
  humans: FragmentType<typeof NewConversationSelector_HumansFragment>[]
}

export const NewConversationSelector = (props: NewConversationSelectorProps) => {
  const assistants = useFragment(NewConversationSelector_AssistantsFragment, props.assistants)
  const humans = useFragment(NewConversationSelector_HumansFragment, props.humans)

  return <ParticipantsDialog assistants={assistants} humans={humans} dialogMode="new" />
}
