import { graphql } from '../../../gql'
import { FileConversion_ListFragment } from '../../../gql/graphql'

graphql(`
  fragment FileConversion_List on AiLibraryFileConversion {
    id
    createdAt
    success
    hasTimeout
    hasPartialResult
    hasUnsupportedFormat
    hasConversionError
    hasLegacyFormat
    metadata
    fileConverterOptions
    processingTimeMs
  }
`)

interface FileConversionListProps {
  conversions: FileConversion_ListFragment[]
}

export const FileConversionList = ({ conversions }: FileConversionListProps) => {
  return (
    <div>
      <h2>File Converstations</h2>
      <ul>
        {conversions.map((conversion) => (
          <li key={conversion.id} className="mb-4">
            <div>Conversion ID: {conversion.id}</div>
            <div>Created At: {new Date(conversion.createdAt).toLocaleString()}</div>
            <div>Success: {conversion.success ? 'Yes' : 'No'}</div>
            <div>Timeout: {conversion.hasTimeout ? 'Yes' : 'No'}</div>
            <div>Partial Result: {conversion.hasPartialResult ? 'Yes' : 'No'}</div>
            <div>Unsupported Format: {conversion.hasUnsupportedFormat ? 'Yes' : 'No'}</div>
            <div>Conversion Error: {conversion.hasConversionError ? 'Yes' : 'No'}</div>
            <div>Legacy Format: {conversion.hasLegacyFormat ? 'Yes' : 'No'}</div>
            <div>Metadata: {conversion.metadata}</div>
            <div>File Converter Options: {conversion.fileConverterOptions}</div>
            <div>Processing Time (ms): {conversion.processingTimeMs}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
