import { useNavigate } from '@tanstack/react-router'

import { AiLibrary } from '../../gql/graphql'
import { Listbox } from '../listbox'

interface LibrarySelectorProps {
  libraries: Pick<AiLibrary, 'id' | 'name'>[]
  selectedLibrary: Pick<AiLibrary, 'id' | 'name'>
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
        })
      }}
    />
  )
}
