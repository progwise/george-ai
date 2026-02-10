import { graphql } from '../../../gql'
import { FileInfoBox_FileFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ClientDate } from '../../client-date'

graphql(`
  fragment FileInfoBox_File on AiLibraryFile {
    id
    libraryId
    size
    status
    chunkCount
    originUri
    uploadedAt
    archivedAt
    crawler {
      uri
      uriType
    }
    manifest {
      extractions {
        extractionMethod
        extractionDate
        extractionHash
      }
      usage {
        sourceBytes
        extractedBytes
        physicalBytes
        activeExtractions
        lastReconcile
      }
    }
    originModificationDate
  }
`)

interface FileInfoBoxProps {
  file: FileInfoBox_FileFragment
}

export const FileInfoBox = ({ file }: FileInfoBoxProps) => {
  const { t } = useTranslation()

  return (
    <dl className="properties max-w-100 text-xs">
      <dt>{t('labels.size')}</dt>
      <dd>{file.size} bytes</dd>
      <dt>{t('labels.status')}</dt>
      <dd>{file.status}</dd>
      <dt>{t('labels.chunkCount')}</dt>
      <dd>{file.chunkCount ?? '-'}</dd>
      <dt>{t('labels.crawler')}</dt>
      <dd>{file.crawler ? `${file.crawler.uri} (${file.crawler.uriType})` : '-'}</dd>
      <dt>{t('labels.originModified')}</dt>
      <dd>
        <ClientDate date={file.originModificationDate} />
      </dd>
    </dl>
  )
}
