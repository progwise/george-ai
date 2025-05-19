import { FragmentType, graphql, useFragment } from '../../../gql'
import { LibraryDeleteDialog } from './library-delete-dialog'
import { LibraryLeaveDialog } from './library-leave-dialog'

const LibraryDeleteOrLeaveDialogButton_LibraryFragment = graphql(`
  fragment LibraryDeleteOrLeaveDialogButton_Library on AiLibrary {
    ownerId
    ...LibraryDeleteDialog_Library
    ...LibraryLeaveDialog_Library
  }
`)

interface LibraryDeleteOrLeaveDialogButtonProps {
  library: FragmentType<typeof LibraryDeleteOrLeaveDialogButton_LibraryFragment>
  userId: string
}

export const LibraryDeleteOrLeaveDialogButton = (props: LibraryDeleteOrLeaveDialogButtonProps) => {
  const library = useFragment(LibraryDeleteOrLeaveDialogButton_LibraryFragment, props.library)

  const isOwner = props.userId === library.ownerId

  return isOwner ? (
    <LibraryDeleteDialog library={library} />
  ) : (
    <LibraryLeaveDialog library={library} userId={props.userId} />
  )
}
