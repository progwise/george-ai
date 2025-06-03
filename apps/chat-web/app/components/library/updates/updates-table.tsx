import { Link } from '@tanstack/react-router'

import { dateTimeString } from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import { AiLibraryUpdate_TableItemFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'

graphql(`
  fragment AiLibraryUpdate_TableItem on AiLibraryUpdate {
    id
    createdAt
    libraryId
    crawlerRunId
    crawlerRun {
      id
      crawlerId
      crawler {
        id
        url
      }
    }
    fileId
    file {
      id
      name
    }
    success
    message
  }
`)

interface UpdatesTableProps {
  updates: AiLibraryUpdate_TableItemFragment[]
  firstItemNumber?: number
}

export const UpdatesTable = ({ updates, firstItemNumber }: UpdatesTableProps) => {
  const { t, language } = useTranslation()
  return (
    <div className="overflow-x-auto">
      <table className="table-zebra table-xs table">
        <thead>
          <tr>
            <th></th>
            <th>Date</th>
            <th>Crawler</th>
            <th>File</th>
            <th>Success</th>
            <th>Message</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {updates.map((update, index) => (
            <tr key={update.id} className="hover:bg-base-300">
              <td>{index + (firstItemNumber ?? 1)}</td>
              <td>{dateTimeString(update.createdAt, language)}</td>
              <td>
                {update?.crawlerRun?.crawler ? (
                  <Link to="/libraries/$libraryId/crawlers" params={{ libraryId: update.libraryId }}>
                    {update.crawlerRun.crawler.url}
                  </Link>
                ) : (
                  'N/A'
                )}
              </td>
              <td>
                {update.file ? (
                  <Link to="/libraries/$libraryId" params={{ libraryId: update.libraryId }}>
                    {update.file.name}
                  </Link>
                ) : (
                  'N/A'
                )}
              </td>
              <td>{update.success ? 'Yes' : 'No'}</td>
              <td>{update.message}</td>
              <td>
                {/* Placeholder for action buttons, e.g., view details, retry, etc. */}
                <button type="button" className="btn btn-sm btn-ghost">
                  {t('actions.details')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
