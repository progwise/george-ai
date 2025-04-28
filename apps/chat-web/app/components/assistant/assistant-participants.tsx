import { FragmentType, graphql, useFragment } from '../../gql'
import { AssistantParticipantsDialog } from './assistant-participants-dialog'

const AssistantParticipants_AssistantFragment = graphql(`
  fragment AssistantParticipants_Assistant on AiAssistant {
    id
    ownerId
    ...AssistantParticipantsDialog_Assistant
  }
`)

interface AssistantParticipantsProps {
  assistant: FragmentType<typeof AssistantParticipants_AssistantFragment>
  userId: string
}

export const AssistantParticipants = (props: AssistantParticipantsProps) => {
  const assistant = useFragment(AssistantParticipants_AssistantFragment, props.assistant)

  const isOwner = assistant.ownerId === props.userId

  return <div>{isOwner && <AssistantParticipantsDialog assistant={assistant} userId={props.userId} />}</div>
}
