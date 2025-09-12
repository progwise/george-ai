import { Link } from '@tanstack/react-router'

import { AiLibraryFileInfo_CaptionCardFragment } from '../../../gql/graphql'

interface FileNavigationProps {
  file: AiLibraryFileInfo_CaptionCardFragment
}
export const FileNavigation = ({ file }: FileNavigationProps) => {
  return (
    <ul className="menu menu-sm menu-horizontal bg-base-200 rounded-box flex-nowrap shadow-lg">
      <li>
        <Link
          className="btn btn-xs rounded-full"
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
          className="btn btn-xs rounded-full"
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
          className="btn btn-xs rounded-full"
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
          className="btn btn-xs rounded-full"
          activeProps={{ className: 'btn-active btn-primary' }}
          activeOptions={{ exact: false }}
          to="/libraries/$libraryId/files/$fileId/similarity"
          params={{ libraryId: file.libraryId, fileId: file.id }}
        >
          Similarity
        </Link>
      </li>
    </ul>
  )
}
