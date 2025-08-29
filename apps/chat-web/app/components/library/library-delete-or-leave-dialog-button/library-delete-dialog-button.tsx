import { AiLibraryDetailFragment } from '../../../gql/graphql'
import { LibraryDeleteDialog } from './library-delete-dialog'

interface LibraryDeleteDialogButtonProps {
  library: AiLibraryDetailFragment
  userId: string
}

export const LibraryDeletDialogButton = ({ library, userId }: LibraryDeleteDialogButtonProps) => {
  const isOwner = userId === library.ownerId

  return isOwner ? <LibraryDeleteDialog library={library} /> : null
}
