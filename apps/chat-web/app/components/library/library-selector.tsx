import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AiLibrary } from '../../gql/graphql'
import { Listbox } from '../listbox'

interface LibrarySelectorProps {
  libraries: Pick<AiLibrary, 'id' | 'name'>[]
  selectedLibrary: Pick<AiLibrary, 'id' | 'name'>
}

export const LibrarySelector = ({
  libraries,
  selectedLibrary,
}: LibrarySelectorProps) => {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(selectedLibrary)

  return (
    <Listbox
      items={libraries}
      selectedItem={selected}
      onChange={(newLibrary) => {
        setSelected(newLibrary)
        navigate({
          to: '/libraries/$libraryId',
          params: { libraryId: newLibrary.id },
        })
      }}
    />
  )
}
