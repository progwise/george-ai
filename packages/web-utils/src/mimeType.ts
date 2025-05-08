export const getMimeTypeFromFileName = (fileName: string) => {
  const trimmedFileName = fileName.trim().toLowerCase()
  const fileExtension = trimmedFileName.split('.').pop()
  switch (fileExtension) {
    case 'pdf':
      return 'application/pdf'
    case 'txt':
      return 'text/plain'
    case 'csv':
      return 'text/csv'
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'bmp':
      return 'image/bmp'
    case 'webp':
      return 'image/webp'
    case 'svg':
      return 'image/svg+xml'
    case 'md':
      return 'text/markdown'
    default:
      return 'application/octet-stream' // Fallback for unknown file types
  }
}
