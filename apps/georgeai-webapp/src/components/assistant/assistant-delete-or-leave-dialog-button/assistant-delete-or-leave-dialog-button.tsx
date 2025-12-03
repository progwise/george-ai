import { AssistantBaseFragment } from '../../../gql/graphql'
import { AssistantDeleteDialog } from './assistant-delete-dialog'

interface AssistantDeleteOrLeaveDialogButtonProps {
  assistant: AssistantBaseFragment
  userId: string
}

export const AssistantDeleteOrLeaveDialogButton = ({ assistant, userId }: AssistantDeleteOrLeaveDialogButtonProps) => {
  const isOwner = userId === assistant.ownerId

  // Only owners can delete assistants (workspace members have access but can't delete)
  if (!isOwner) {
    return null
  }

  return <AssistantDeleteDialog assistant={assistant} />
}
