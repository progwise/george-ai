export type FileMimeType =
  | 'application/pdf'
  | 'text/plain'
  | 'text/csv'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

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
    default:
      throw new Error(`Unsupported mime type ${mimeType}`)
  }
}
