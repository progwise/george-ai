export type FileMimeType =
  | 'application/pdf'
  | 'text/plain'
  | 'text/csv'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export const getFileExtension = (mimeType: string) => {
  switch (mimeType) {
    case 'application/pdf':
      return 'pdf'
    case 'text/plain':
      return 'txt'
    case 'text/csv':
      return 'csv'
    case 'text/markdown':
      return 'md'
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'docx'
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'xlsx'
    default:
      throw new Error(`Unsupported mime type ${mimeType}`)
  }
}
