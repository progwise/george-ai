import { AiLibraryDetailFragment } from '../../../gql/graphql'
import { LibraryDeleteDialog } from './library-delete-dialog'
import { LibraryLeaveDialog } from './library-leave-dialog'

interface LibraryDeleteOrLeaveDialogButtonProps {
  library: AiLibraryDetailFragment
  userId: string
}

export const LibraryDeleteOrLeaveDialogButton = ({ library, userId }: LibraryDeleteOrLeaveDialogButtonProps) => {
  const isOwner = userId === library.ownerId

  return isOwner ? <LibraryDeleteDialog library={library} /> : <LibraryLeaveDialog library={library} userId={userId} />
}
