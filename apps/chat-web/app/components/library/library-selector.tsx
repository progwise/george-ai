import { useNavigate } from '@tanstack/react-router'

import { FragmentType, graphql, useFragment } from '../../gql'
import { Listbox } from '../listbox'

const LibrarySelector_LibraryFragment = graphql(`
  fragment LibrarySelector_Library on AiLibrary {
    id
    name
  }
`)

interface LibrarySelectorProps {
  libraries: FragmentType<typeof LibrarySelector_LibraryFragment>[]
  selectedLibrary: FragmentType<typeof LibrarySelector_LibraryFragment>
}
export const LibrarySelector = (props: LibrarySelectorProps) => {
  const libraries = useFragment(LibrarySelector_LibraryFragment, props.libraries)
  const selectedLibrary = useFragment(LibrarySelector_LibraryFragment, props.selectedLibrary)
  const navigate = useNavigate()

  return (
    <Listbox
      items={libraries}
      selectedItem={selectedLibrary}
      onChange={(newLibrary) => {
        navigate({
          to: '/libraries/$libraryId',
          params: { libraryId: newLibrary!.id },
        })
      }}
    />
  )
}
