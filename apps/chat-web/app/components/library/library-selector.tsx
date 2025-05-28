import { useNavigate } from '@tanstack/react-router'

import { AiLibraryBaseFragment } from '../../gql/graphql'
import { Listbox } from '../listbox'

interface LibrarySelectorProps {
  libraries: AiLibraryBaseFragment[]
  selectedLibrary: AiLibraryBaseFragment
}
export const LibrarySelector = ({ libraries, selectedLibrary }: LibrarySelectorProps) => {
  const navigate = useNavigate()

  return (
    <Listbox
      items={libraries}
      selectedItem={selectedLibrary}
      onChange={(newLibrary) => {
        navigate({
          to: '/libraries/$libraryId',
          params: { libraryId: newLibrary!.id },
          search: {
            page: 1,
            column: 'index',
            direction: 'asc',
            itemsPerPage: 5,
          },
        })
      }}
    />
  )
}
