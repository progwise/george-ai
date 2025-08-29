import { graphql } from '../../../gql'
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
    chunks
    conversionsCount
    lastSuccessfulConversion {
      id
      createdAt
    }
    lastConversion {
      id
      createdAt
    }
    lastConversion {
      id
      createdAt
    }
    lastSuccessfulConversion {
      id
      createdAt
    }
    processingErrorMessage
  }
`)

interface FileTitleCardProps {
  fileInfo: AiLibraryFileInfo_TitleCardFragment
}

export const FileTitleCard = ({ fileInfo }: FileTitleCardProps) => {
  const { t } = useTranslation()
  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-lg font-medium text-gray-900">{fileInfo.aiLibraryFile.name}</div>
      <div className="text-sm text-gray-600">
        <ul className="space-y-1">
          <li>
            <strong>{t('labels.size')}:</strong> {fileInfo.aiLibraryFile.size} bytes
          </li>
          <li>
            <strong>{t('labels.status')}:</strong> {fileInfo.aiLibraryFile.status}
          </li>
          <li>
            <strong>{t('labels.chunks')}:</strong> {fileInfo.aiLibraryFile.chunkCount}
          </li>
          <li>
            <strong>{t('labels.conversions')}:</strong> {fileInfo.aiLibraryFile.conversionCount}
          </li>
          {fileInfo.aiLibraryFile.originModificationDate && (
            <li>
              <strong>{t('labels.originModificationDate')}:</strong>{' '}
              {new Date(fileInfo.aiLibraryFile.originModificationDate).toLocaleString()}
            </li>
          )}
          {fileInfo.aiLibraryFile.processingErrorMessage && (
            <li>
              <strong className="text-red-600">{t('labels.error')}:</strong>{' '}
              {fileInfo.aiLibraryFile.processingErrorMessage}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
