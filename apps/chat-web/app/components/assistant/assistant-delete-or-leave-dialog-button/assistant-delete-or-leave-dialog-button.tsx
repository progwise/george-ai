import { AssistantBaseFragment } from '../../../gql/graphql'
import { AssistantDeleteDialog } from './assistant-delete-dialog'
import { AssistantLeaveDialog } from './assistant-leave-dialog'

interface AssistantDeleteOrLeaveDialogButtonProps {
  assistant: AssistantBaseFragment
  userId: string
}

export const AssistantDeleteOrLeaveDialogButton = ({ assistant, userId }: AssistantDeleteOrLeaveDialogButtonProps) => {
  const isOwner = userId === assistant.ownerId

  return isOwner ? (
    <AssistantDeleteDialog assistant={assistant} userId={userId} />
  ) : (
    <AssistantLeaveDialog assistant={assistant} userId={userId} />
  )
}
