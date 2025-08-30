import { graphql } from '../../../gql'
import { AiLibraryFileInfo_TitleCardFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'

graphql(`
  fragment AiLibraryFileInfo_TitleCard on AiLibraryFile {
    id
    name
    originUri
    originModificationDate
    size
    uploadedAt
    archivedAt
    taskCount
    status
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

interface FileTitleCardProps {
  fileInfo: AiLibraryFileInfo_TitleCardFragment
}

export const FileTitleCard = ({ fileInfo }: FileTitleCardProps) => {
  const { t } = useTranslation()
  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-lg font-medium text-gray-900">{fileInfo.name}</div>
      <div className="text-sm text-gray-600">
        <ul className="space-y-1">
          <li>
            <strong>{t('labels.size')}:</strong> {fileInfo.size} bytes
          </li>
          <li>
            <strong>{t('labels.status')}:</strong> {fileInfo.status}
          </li>
          <li>
            <strong>{t('labels.chunks')}:</strong> {fileInfo.lastSuccessfulEmbedding?.chunksCount || 'unknown'}
          </li>
          <li>
            <strong>{t('labels.tasks')}:</strong> {fileInfo.taskCount}
          </li>
          {fileInfo.originModificationDate && (
            <li>
              <strong>{t('labels.originModificationDate')}:</strong>{' '}
              {new Date(fileInfo.originModificationDate).toLocaleString()}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
