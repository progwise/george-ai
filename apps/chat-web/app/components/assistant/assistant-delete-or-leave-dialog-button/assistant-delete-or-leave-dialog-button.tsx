import { FragmentType, graphql, useFragment } from '../../../gql'
import { AssistantDeleteDialog } from './assistant-delete-dialog'
import { AssistantLeaveDialog } from './assistant-leave-dialog'

const AssistantDeleteOrLeaveDialogButton_AssistantFragment = graphql(`
  fragment AssistantDeleteOrLeaveDialogButton_Assistant on AiAssistant {
    ownerId
    ...AssistantDeleteDialog_Assistant
    ...AssistantLeaveDialog_Assistant
  }
`)

interface AssistantDeleteOrLeaveDialogButtonProps {
  assistant: FragmentType<typeof AssistantDeleteOrLeaveDialogButton_AssistantFragment>
  userId: string
}

export const AssistantDeleteOrLeaveDialogButton = (props: AssistantDeleteOrLeaveDialogButtonProps) => {
  const assistant = useFragment(AssistantDeleteOrLeaveDialogButton_AssistantFragment, props.assistant)

  const isOwner = props.userId === assistant.ownerId

  return isOwner ? (
    <AssistantDeleteDialog assistant={assistant} userId={props.userId} />
  ) : (
    <AssistantLeaveDialog assistant={assistant} userId={props.userId} />
  )
}
