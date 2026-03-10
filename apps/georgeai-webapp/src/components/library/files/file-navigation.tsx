import { Link } from '@tanstack/react-router'

interface FileNavigationProps {
  fileId: string
  libraryId: string
}
export const FileNavigation = ({ fileId, libraryId }: FileNavigationProps) => {
  return (
    <div role="tablist" className="tabs-lift tabs">
      <a className="tab tab-disabled flex-1 cursor-default text-center">
        {/* Placeholder empty tab for filling up the line... */}
      </a>
      <Link
        className="tab"
        activeOptions={{ exact: true, includeSearch: false }}
        activeProps={{ className: 'tab-active' }}
        role="tab"
        to="/libraries/$libraryId/files/$fileId"
        params={{ libraryId, fileId }}
      >
        Markdown
      </Link>
      <Link
        className="tab"
        activeOptions={{ exact: false }}
        activeProps={{ className: 'tab-active' }}
        role="tab"
        to="/libraries/$libraryId/files/$fileId/tasks"
        params={{ libraryId, fileId }}
      >
        Tasks
      </Link>
      <Link
        className="tab"
        activeOptions={{ exact: false }}
        activeProps={{ className: 'tab-active' }}
        role="tab"
        to="/libraries/$libraryId/files/$fileId/chunks"
        params={{ libraryId, fileId }}
      >
        Chunks
      </Link>
      <Link
        className="tab"
        activeOptions={{ exact: false }}
        activeProps={{ className: 'tab-active' }}
        role="tab"
        to="/libraries/$libraryId/files/$fileId/similarity"
        params={{ libraryId, fileId }}
      >
        Similarity
      </Link>
      <a className="tab tab-disabled flex-1 cursor-default text-center">
        {/* Placeholder empty tab for filling up the line... */}
      </a>
    </div>
  )
}
