import { Link } from '@tanstack/react-router'
import { AiLibrary } from '../../gql/graphql'

interface LibrarySelectorProps {
  libraries: Pick<AiLibrary, 'id' | 'name'>[]
  selectedLibrary: Pick<AiLibrary, 'id' | 'name'>
}

export const LibrarySelector = (props: LibrarySelectorProps) => {
  const { libraries, selectedLibrary } = props
  return (
    <div className="dropdown dropdown-sm">
      <div tabIndex={0} role="button" className="btn btn-sm">
        {selectedLibrary.name}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
      >
        {libraries.map((library) => (
          <li key={library.id}>
            <Link
              to={'/library/$libraryId'}
              params={{ libraryId: library.id }}
              onClick={(event) => {
                event.currentTarget.blur()
              }}
            >
              {library.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
