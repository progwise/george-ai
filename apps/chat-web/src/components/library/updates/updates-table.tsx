import { Link } from '@tanstack/react-router'

import { dateTimeString } from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import { AiLibraryUpdate_TableItemFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { UpdateStatusBadge } from '../crawler/update-status-badge'

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
        uri
        uriType
      }
    }
    fileId
    file {
      id
      name
    }
    message
    updateType
    filePath
    fileName
    fileSize
    filterType
    filterValue
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
            <th>{t('updates.status')}</th>
            <th>{t('updates.date')}</th>
            <th>
              {t('updates.file')}/{t('updates.crawler')}
            </th>
            <th>{t('updates.message')}</th>
          </tr>
        </thead>
        <tbody>
          {updates.map((update, index) => {
            const isOmitted = update.updateType === 'omitted'
            const displayFileName = isOmitted ? update.fileName : update.file?.name
            const displayFilePath = isOmitted ? update.filePath : null

            return (
              <tr key={update.id} className="hover:bg-base-300">
                <td>{index + (firstItemNumber ?? 1)}</td>
                <td>
                  <UpdateStatusBadge updateType={update.updateType} size="xs" />
                </td>
                <td>{dateTimeString(update.createdAt, language)}</td>
                <td>
                  <div className="font-semibold">
                    {update.file ? (
                      <Link
                        to="/libraries/$libraryId/files/$fileId"
                        params={{ libraryId: update.libraryId, fileId: update.file.id }}
                      >
                        {update.file.name}
                      </Link>
                    ) : isOmitted && displayFileName ? (
                      displayFilePath ? (
                        <a
                          href={displayFilePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary text-gray-600"
                          title={displayFilePath}
                        >
                          {displayFileName}
                        </a>
                      ) : (
                        <span title={displayFilePath || undefined} className="text-gray-600">
                          {displayFileName}
                        </span>
                      )
                    ) : (
                      'N/A'
                    )}
                  </div>
                  <div>
                    {update?.crawlerRun?.crawler ? (
                      <Link to="/libraries/$libraryId/crawlers" params={{ libraryId: update.libraryId }}>
                        {update.crawlerRun.crawler.uri}
                      </Link>
                    ) : (
                      'N/A'
                    )}
                  </div>
                </td>

                <td>
                  {isOmitted ? (
                    <div className="text-sm">
                      <div>{update.message}</div>
                      {update.filterType && update.filterValue && (
                        <div className="mt-1 text-xs text-gray-500">
                          {update.filterType}: {update.filterValue}
                        </div>
                      )}
                    </div>
                  ) : (
                    update.message
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
