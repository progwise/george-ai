import { twMerge } from 'tailwind-merge'

import { graphql } from '../../../gql'
import { FileStatusLabels_FileFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'

graphql(`
  fragment FileStatusLabels_File on AiLibraryFile {
    id
    name
    supportedExtractionMethods
    manifest {
      extractions {
        extractionMethod
        sourceHash
        created
        updated
      }
    }
    embeddingStatistics {
      extractionMethod
      modelName
      chunkCount
    }
  }
`)

interface FileStatusLabelsProps {
  file: FileStatusLabels_FileFragment
}

export const FileStatusLabels = ({ file }: FileStatusLabelsProps) => {
  useTranslation()
  const { supportedExtractionMethods, manifest, embeddingStatistics } = file

  const sortedExtractions = manifest?.extractions.sort(
    (a, b) => new Date(b.updated || b.created).getTime() - new Date(a.updated || a.created).getTime(),
  )

  const extractionsWithEmbeddingInfo = sortedExtractions?.map((extraction) => {
    const embedding = embeddingStatistics?.find((e) => e.extractionMethod === extraction.extractionMethod)
    return { ...extraction, embedding }
  })

  return (
    <div className="flex gap-2">
      {supportedExtractionMethods.length === 0 ? (
        <div key="unsupported" className="badge gap-1 badge-xs text-nowrap badge-error">
          <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
              clipRule="evenodd"
            />
          </svg>
          <div>Unsupported Format</div>
        </div>
      ) : (
        supportedExtractionMethods.map((method) => {
          const embeddingInfos = extractionsWithEmbeddingInfo?.filter((e) => e.extractionMethod === method) || []
          const embedding = embeddingInfos
            .map((e) => (e.embedding ? `${e.embedding.modelName} (${e.embedding.chunkCount.toLocaleString()})` : null))
            .filter((info): info is string => info !== null)
            .join(', ')
          return (
            <div key={method} className={twMerge('badge gap-1 badge-xs text-nowrap badge-info')}>
              <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                {method} ({embedding})
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
