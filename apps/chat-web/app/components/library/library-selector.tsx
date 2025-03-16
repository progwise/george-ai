import { useNavigate } from '@tanstack/react-router'

import { AiLibrary } from '../../gql/graphql'
import { Select, SelectItem } from '../form/select'

interface LibrarySelectorProps {
  libraries: Pick<AiLibrary, 'id' | 'name'>[]
  selectedLibrary: Pick<AiLibrary, 'id' | 'name'>
}

export const LibrarySelector = ({ libraries, selectedLibrary }: LibrarySelectorProps) => {
  const navigate = useNavigate()

  const libraryOptions: SelectItem[] = libraries.map((library) => ({ id: library.id, name: library.name }))
  const selectedLibraryOption: SelectItem = { id: selectedLibrary.id, name: selectedLibrary.name }

  return (
    <Select
      options={libraryOptions}
      value={selectedLibraryOption}
      onBlur={(newLibrary) => {
        navigate({
          to: '/libraries/$libraryId',
          params: { libraryId: newLibrary!.id },
        })
      }}
      name="library"
      label="Select Library"
    />
  )
}
