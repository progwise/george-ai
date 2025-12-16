import { Link } from '@tanstack/react-router'

import { AiLibraryFileInfo_CaptionCardFragment } from '../../../gql/graphql'

interface FileNavigationProps {
  file: AiLibraryFileInfo_CaptionCardFragment
}
export const FileNavigation = ({ file }: FileNavigationProps) => {
  return (
    <ul className="menu menu-horizontal flex-nowrap menu-sm rounded-box bg-base-200 shadow-lg">
      <li>
        <Link
          className="btn rounded-full btn-xs"
          activeProps={{ className: 'btn-active btn-primary' }}
          activeOptions={{ exact: true, includeSearch: false }}
          to="/libraries/$libraryId/files/$fileId"
          params={{ libraryId: file.libraryId, fileId: file.id }}
        >
          Markdown
        </Link>
      </li>
      <li>
        <Link
          className="btn rounded-full btn-xs"
          activeProps={{ className: 'btn-active btn-primary' }}
          activeOptions={{ exact: false }}
          to="/libraries/$libraryId/files/$fileId/tasks"
          params={{ libraryId: file.libraryId, fileId: file.id }}
        >
          Tasks
        </Link>
      </li>
      <li>
        <Link
          className="btn rounded-full btn-xs"
          activeProps={{ className: 'btn-active btn-primary' }}
          activeOptions={{ exact: false }}
          to="/libraries/$libraryId/files/$fileId/chunks"
          params={{ libraryId: file.libraryId, fileId: file.id }}
        >
          Chunks
        </Link>
      </li>
      <li>
        <Link
          className="btn rounded-full btn-xs"
          activeProps={{ className: 'btn-active btn-primary' }}
          activeOptions={{ exact: false }}
          to="/libraries/$libraryId/files/$fileId/similarity"
          params={{ libraryId: file.libraryId, fileId: file.id }}
        >
          Similarity
        </Link>
      </li>
      <li>
        <Link
          className="btn rounded-full btn-xs"
          activeProps={{ className: 'btn-active btn-primary' }}
          activeOptions={{ exact: false }}
          to="/libraries/$libraryId/files/$fileId/usages"
          params={{ libraryId: file.libraryId, fileId: file.id }}
        >
          Usages
        </Link>
      </li>
    </ul>
  )
}
