import { graphql } from '../../../gql'
import { AiLibraryFile_FileStatusLabelsFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ClientDate } from '../../client-date'

graphql(`
  fragment AiLibraryFile_FileStatusLabels on AiLibraryFile {
    id
    isLegacyFile
    lastSuccessfulExtraction {
      id
      extractionTimeMs
      extractionFinishedAt
      metadata
    }
    lastSuccessfulEmbedding {
      id
      embeddingTimeMs
      embeddingFinishedAt
      metadata
    }
    supportedExtractionMethods
    isLegacyFile
    name
  }
`)

interface FileStatusLabelsProps {
  file: AiLibraryFile_FileStatusLabelsFragment
}

export const FileStatusLabels = ({ file }: FileStatusLabelsProps) => {
  useTranslation()
  const renderConversionStatus = () => {
    const { supportedExtractionMethods, isLegacyFile, lastSuccessfulExtraction, lastSuccessfulEmbedding } = file

    // Show status indicators
    const statusItems = []

    if (isLegacyFile) {
      statusItems.push(
        <div key="legacy" className="badge gap-1 badge-xs text-nowrap badge-info">
          <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Legacy File
        </div>,
      )
    }

    if (lastSuccessfulExtraction) {
      statusItems.push(
        <div key="success" className="badge gap-1 badge-xs text-nowrap badge-success">
          <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex gap-1">
            Extraction <ClientDate date={lastSuccessfulExtraction.extractionFinishedAt} format="dateTime" />
          </div>
        </div>,
      )
    }

    if (lastSuccessfulEmbedding) {
      statusItems.push(
        <div key="timeout" className="badge gap-1 badge-xs text-nowrap badge-warning">
          <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex gap-1">
            Embedding <ClientDate date={lastSuccessfulEmbedding.embeddingFinishedAt} format="dateTime" />
          </div>
        </div>,
      )
    }

    if (supportedExtractionMethods.length === 0) {
      statusItems.push(
        <div key="unsupported" className="badge gap-1 badge-xs text-nowrap badge-error">
          <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
              clipRule="evenodd"
            />
          </svg>
          <div>Unsupported Format</div>
        </div>,
      )
    }

    if (statusItems.length === 0) return null

    return statusItems
  }

  return <div className="flex gap-2">{renderConversionStatus()}</div>
}
