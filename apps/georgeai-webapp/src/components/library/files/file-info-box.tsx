import { type ReactNode } from 'react'

import { formatBytes } from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import { FileInfoBox_FileFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ClientDate } from '../../client-date'

graphql(`
  fragment FileInfoBox_File on AiLibraryFile {
    id
    name
    libraryId
    size
    status
    chunkCount
    originUri
    createdAt
    archivedAt
    crawler {
      uri
      uriType
    }
    manifest {
      documentId
      name
      mimeType
      sourceHash
      created
      origin {
        uri
        hash
        creationDate
        lastModifiedDate
        author
      }
      extractions {
        extractionMethod
        sourceHash
        created
        updated
      }
      storageStats {
        extractionBytes
        attachmentBytes
        physicalBytes
        extractionFileCount
        physicalFileCount
        attachmentFileCount
        lastUpdate
        lastReconcile
      }
    }
    originModificationDate
  }
`)

const InfoField = ({ label, value }: { label: string; value: ReactNode }) => (
  <div>
    <div className="text-xs text-base-content/50">{label}</div>
    <div className="text-sm">{value}</div>
  </div>
)

interface FileInfoBoxProps {
  file: FileInfoBox_FileFragment
}

export const FileInfoBox = ({ file }: FileInfoBoxProps) => {
  const { t } = useTranslation()
  return (
    <div className="w-96 space-y-3 p-3">
      <section>
        <h4 className="mb-2 text-xs font-semibold tracking-wide text-base-content/80 uppercase">{file.name}</h4>

        <div className="grid grid-cols-1 gap-x-4 gap-y-2">
          <InfoField label="Origin URI" value={file.originUri ?? '-'} />
        </div>
      </section>
      <div className="divider my-0" />

      <section>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <InfoField label="Status" value={file.status} />
          <InfoField label="Total Size" value={formatBytes(file.manifest?.storageStats.physicalBytes)} />
        </div>
      </section>
      <div className="divider my-0" />

      <section>
        <h4 className="mb-2 text-xs font-semibold tracking-wide text-base-content/50 uppercase">Usage</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <InfoField label="Extractions" value={formatBytes(file.manifest?.storageStats.extractionBytes)} />
          <InfoField label="Chunks" value={file.chunkCount ?? '-'} />
          <InfoField label="Crawler" value={file.crawler ? `${file.crawler.uri} (${file.crawler.uriType})` : '-'} />
        </div>
      </section>
      <div className="divider my-0" />

      <section>
        <h4 className="mb-2 text-xs font-semibold tracking-wide text-base-content/50 uppercase">Processing</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <InfoField
            label="Extractions"
            value={file.manifest?.extractions.map((extraction) => extraction.extractionMethod).join(', ') || '-'}
          />
          <InfoField
            label="Last Reconcile"
            value={
              file.manifest?.storageStats?.lastReconcile ? (
                <ClientDate date={file.manifest.storageStats.lastReconcile} />
              ) : (
                '-'
              )
            }
          />
        </div>
      </section>

      <div className="divider my-0" />

      <section>
        <h4 className="mb-2 text-xs font-semibold tracking-wide text-base-content/50 uppercase">Dates</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <InfoField label={t('labels.originModified')} value={<ClientDate date={file.originModificationDate} />} />
          <InfoField label="Created" value={<ClientDate date={file.createdAt} />} />
          <InfoField
            label="Origin last modified"
            value={file.manifest ? <ClientDate date={file.manifest.origin?.lastModifiedDate} /> : '-'}
          />
          <InfoField label="Origin Uri" value={file.manifest ? <ClientDate date={file.manifest.origin?.uri} /> : '-'} />
          <InfoField label="Archived" value={file.archivedAt ? <ClientDate date={file.archivedAt} /> : '-'} />
        </div>
      </section>
    </div>
  )
}
