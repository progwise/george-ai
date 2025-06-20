import { useNavigate, useParams } from '@tanstack/react-router'

import { AiLibraryBaseFragment } from '../../gql/graphql'
import { Listbox } from '../listbox'

interface LibrarySelectorProps {
  libraries: AiLibraryBaseFragment[]
  selectedLibrary: AiLibraryBaseFragment
}
export const LibrarySelector = ({ libraries, selectedLibrary }: LibrarySelectorProps) => {
  const navigate = useNavigate()
  const params = useParams({ strict: false })

  return (
    <Listbox
      items={libraries}
      selectedItem={selectedLibrary}
      onChange={(newLibrary) => {
        navigate({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          params: { ...params, libraryId: newLibrary.id },
        })
      }}
    />
  )
}
