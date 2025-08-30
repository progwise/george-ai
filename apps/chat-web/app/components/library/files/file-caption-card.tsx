import { Link } from '@tanstack/react-router'

import { graphql } from '../../../gql'
import { AiLibraryFileInfo_CaptionCardFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { useFileActions } from './use-file-actions'

graphql(`
  fragment AiLibraryFileInfo_CaptionCard on AiLibraryFile {
    id
    libraryId
    name
    originUri
    originModificationDate
    size
    uploadedAt
    archivedAt
    taskCount
    status
    sourceFiles {
      fileName
      url
    }
    lastSuccessfulExtraction {
      id
      createdAt
      markdownFileName
      extractionStartedAt
      extractionFinishedAt
      processingStatus
      metadata
    }
    lastSuccessfulEmbedding {
      id
      createdAt
      markdownFileName
      embeddingStartedAt
      embeddingFinishedAt
      processingStatus
      metadata
      chunksCount
    }
  }
`)

interface FileCaptionCardProps {
  file: AiLibraryFileInfo_CaptionCardFragment
}

export const FileCaptionCard = ({ file }: FileCaptionCardProps) => {
  const { t } = useTranslation()

  const params = { libraryId: file.libraryId, fileId: file.id }
  const { createEmbeddingTasksMutation, createExtractionTasksMutation, createTasksMutationPending } = useFileActions({
    fileId: file.id,
  })
  return (
    <div className="card bg-base-100 p-6 shadow-xl">
      <div className="card-title flex items-center justify-between">
        <h3>{file.name}</h3>
        <ul className="menu bg-base-200 menu-horizontal rounded-box gap-2">
          <li>
            <Link
              className="btn btn-ghost btn-sm"
              activeProps={{ className: 'btn-active' }}
              activeOptions={{ exact: true }}
              to="/libraries/$libraryId/files/$fileId"
              params={params}
            >
              Content
            </Link>
          </li>
          <li>
            <Link
              className="btn btn-ghost btn-sm"
              activeProps={{ className: 'btn-active' }}
              activeOptions={{ exact: false }}
              to="/libraries/$libraryId/files/$fileId/chunks"
              params={params}
            >
              Chunks
            </Link>
          </li>
          <li>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => createEmbeddingTasksMutation()}
              disabled={createTasksMutationPending}
            >
              {t('actions.reembed')}
            </button>
          </li>
          <li>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => createExtractionTasksMutation()}
              disabled={createTasksMutationPending}
            >
              {t('actions.reprocess')}
            </button>
          </li>
        </ul>
      </div>
      <div className="flex gap-2 text-sm text-gray-600">
        <ul className="space-y-1">
          <li>
            <strong>{t('labels.size')}:</strong> {file.size} bytes
          </li>
          <li>
            <strong>{t('labels.status')}:</strong> {file.status}
          </li>
          <li>
            <strong>{t('labels.chunks')}:</strong> {file.lastSuccessfulEmbedding?.chunksCount || 'unknown'}
          </li>
          <li>
            <strong>{t('labels.tasks')}:</strong> {file.taskCount}
          </li>
          {file.originModificationDate && (
            <li>
              <strong>{t('labels.originModificationDate')}:</strong>{' '}
              {new Date(file.originModificationDate).toLocaleString()}
            </li>
          )}
        </ul>
        <ul className="list bg-base-100 rouded-box shadow-md">
          {file.sourceFiles.length < 1 && <li className="list-row">{t('files.noSourcesAvailable')}</li>}
          {file.sourceFiles.map((source) => (
            <li className="list-row" key={source.fileName}>
              <a className="link link-hover" href={source.url} target="_blank">
                {source.fileName}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
