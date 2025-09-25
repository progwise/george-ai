import { useNavigate, useRouterState } from '@tanstack/react-router'

import { AiLibraryBaseFragment } from '../../gql/graphql'
import { Listbox } from '../listbox'

interface LibrarySelectorProps {
  libraries: AiLibraryBaseFragment[]
  selectedLibrary: AiLibraryBaseFragment
}
export const LibrarySelector = ({ libraries, selectedLibrary }: LibrarySelectorProps) => {
  const navigate = useNavigate({ from: '/libraries/$libraryId' })
  const lastMatch = useRouterState().matches[0]

  const handleLibraryChange = async (libraryId: string) => {
    if (libraryId === selectedLibrary.id) {
      return
    }

    await navigate({
      params: { ...lastMatch.params, libraryId },
    })
  }

  return (
    <Listbox
      items={libraries}
      className="outline-base-content/30 outline"
      selectedItem={selectedLibrary}
      onChange={(library) => library && handleLibraryChange(library.id)}
    />
  )
}
