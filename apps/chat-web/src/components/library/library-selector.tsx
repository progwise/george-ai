import { useNavigate, useRouterState } from '@tanstack/react-router'

import { AiLibraryBaseFragment } from '../../gql/graphql'
import { Listbox } from '../listbox'

interface LibrarySelectorProps {
  libraries: AiLibraryBaseFragment[]
  selectedLibrary: AiLibraryBaseFragment
}
export const LibrarySelector = ({ libraries, selectedLibrary }: LibrarySelectorProps) => {
  const navigate = useNavigate({ from: '/libraries/$libraryId' })
  const routerState = useRouterState()

  const handleLibraryChange = async (libraryId: string) => {
    if (libraryId === selectedLibrary.id) {
      return
    }
    const lastMatch = routerState.matches[routerState.matches.length - 1]

    if (lastMatch.params['fileId']) {
      await navigate({
        to: '/libraries/$libraryId/files',
        params: { libraryId },
      })

    } else if (lastMatch.params['crawlerId']) {
      await navigate({
        to: '/libraries/$libraryId/crawlers',
        params: { libraryId },
      })
    } else {
      await navigate({
        to: lastMatch.fullPath,
        params: { ...lastMatch.params, libraryId },
      })
    }
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
