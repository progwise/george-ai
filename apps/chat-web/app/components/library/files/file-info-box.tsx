import { graphql } from '../../../gql'
import { AiLibraryFile_InfoBoxFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'

graphql(`
  fragment AiLibraryFile_InfoBox on AiLibraryFile {
    originModificationDate
    size
    uploadedAt
    archivedAt
    taskCount
    status
    crawler {
      id
      uri
      uriType
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

interface FileInfoBoxProps {
  file: AiLibraryFile_InfoBoxFragment
}

export const FileInfoBox = ({ file }: FileInfoBoxProps) => {
  const { t, language } = useTranslation()
  return (
    <dl className="properties max-w-100 text-xs">
      <dt>{t('labels.size')}</dt>
      <dd>{file.size} bytes</dd>
      <dt>{t('labels.status')}</dt>
      <dd>{file.status}</dd>
      <dt>{t('labels.chunks')}</dt>
      <dd>{file.lastSuccessfulEmbedding?.chunksCount || 'unknown'}</dd>
      <dt>{t('labels.tasks')}</dt>
      <dd>{file.taskCount}</dd>
      <dt>{t('labels.crawler')}</dt>
      <dd>{file.crawler ? `${file.crawler.uri} (${file.crawler.uriType})` : '-'}</dd>
      <dt>{t('labels.originModified')}</dt>
      <dd>{file.originModificationDate ? new Date(file.originModificationDate).toLocaleString(language) : '-'}</dd>
    </dl>
  )
}
