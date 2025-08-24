import { graphql } from '../../../gql'
import { FileContentResultFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { FormattedMarkdown } from '../../formatted-markdown'

export const FileContentResultFragmentDoc = graphql(`
  fragment FileContentResult on FileContentResult {
    content
    success
    hasTimeout
    hasPartialResult
    hasUnsupportedFormat
    hasConversionError
    hasLegacyFormat
    isLegacyFile
    fileName
    processingTimeMs
    metadata
  }
`)

export const FileContent = ({
  fileResult,
  sources,
}: {
  fileResult: FileContentResultFragment
  sources: { fileName: string; link: string }[]
}) => {
  const { t } = useTranslation()

  const renderConversionStatus = () => {
    if (!fileResult) return null

    const {
      success,
      hasTimeout,
      hasPartialResult,
      hasUnsupportedFormat,
      hasConversionError,
      hasLegacyFormat,
      isLegacyFile,
      fileName,
      processingTimeMs,
      metadata,
    } = fileResult

    console.log('metadata', metadata)

    // Show status indicators
    const statusItems = []

    if (isLegacyFile) {
      statusItems.push(
        <div key="legacy" className="badge badge-info gap-1">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
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

    if (success && !isLegacyFile) {
      statusItems.push(
        <div key="success" className="badge badge-success gap-1">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Successful Conversion
        </div>,
      )
    }

    if (hasTimeout) {
      statusItems.push(
        <div key="timeout" className="badge badge-warning gap-1">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          Processing Timeout
        </div>,
      )
    }

    if (hasPartialResult) {
      statusItems.push(
        <div key="partial" className="badge badge-warning gap-1">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Partial Result
        </div>,
      )
    }

    if (hasConversionError) {
      statusItems.push(
        <div key="error" className="badge badge-error gap-1">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          Conversion Error
        </div>,
      )
    }

    if (hasUnsupportedFormat) {
      statusItems.push(
        <div key="unsupported" className="badge badge-error gap-1">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
              clipRule="evenodd"
            />
          </svg>
          Unsupported Format
        </div>,
      )
    }

    if (hasLegacyFormat) {
      statusItems.push(
        <div key="legacyformat" className="badge badge-warning gap-1">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Legacy Format
        </div>,
      )
    }

    if (statusItems.length === 0) return null

    return (
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Conversion Status:</span>
          {statusItems}
          {processingTimeMs != null && processingTimeMs > 0 && (
            <div className="badge badge-ghost">
              {processingTimeMs < 1000 ? `${processingTimeMs}ms` : `${(processingTimeMs / 1000).toFixed(1)}s`}
            </div>
          )}
          <div className="text-xs text-gray-500">({fileName})</div>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>{t('files.sources')}</li>
          {sources.length < 1 && <li>{t('files.noSourcesAvailable')}</li>}
          {sources.map((source) => (
            <li key={source.fileName}>
              <a className="link link-hover" href={source.link} target="_blank">
                {source.fileName}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <hr />
      {renderConversionStatus()}
      <FormattedMarkdown
        markdown={fileResult?.content || t('files.noContentAvailable')}
        className="text-sm font-semibold"
      />
    </div>
  )
}
