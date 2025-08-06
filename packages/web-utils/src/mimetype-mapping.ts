const mimeTypes: Record<string, string> = {
  // Text files
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.markdown': 'text/markdown',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.ts': 'application/typescript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.yaml': 'application/x-yaml',
  '.yml': 'application/x-yaml',
  '.csv': 'text/csv',
  '.tsv': 'text/tab-separated-values',

  // Office documents
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.ppt': 'application/vnd.ms-powerpoint',

  // Images
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',

  // Audio/Video
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.wav': 'audio/wav',
  '.avi': 'video/x-msvideo',

  // Archives
  '.zip': 'application/zip',
  '.rar': 'application/x-rar-compressed',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',

  // Code files
  '.py': 'text/x-python',
  '.java': 'text/x-java-source',
  '.c': 'text/x-c',
  '.cpp': 'text/x-c++',
  '.h': 'text/x-c',
  '.hpp': 'text/x-c++',
  '.cs': 'text/x-csharp',
  '.php': 'application/x-httpd-php',
  '.rb': 'application/x-ruby',
  '.go': 'text/x-go',
  '.rs': 'text/x-rust',
  '.sql': 'application/sql',

  // Config files
  '.ini': 'text/plain',
  '.cfg': 'text/plain',
  '.conf': 'text/plain',
  '.env': 'text/plain',
  '.properties': 'text/plain',
  '.log': 'text/plain',
  '.toml': 'application/toml',

  // Scripts and build files
  '.sh': 'application/x-sh',
  '.bat': 'application/x-msdos-program',
  '.ps1': 'application/x-powershell',
  '.dockerfile': 'text/plain',
  '.gitignore': 'text/plain',
  '.gitattributes': 'text/plain',
  '.editorconfig': 'text/plain',
  '.gradle': 'text/plain',
  '.pom': 'application/xml',
  '.sbt': 'text/plain',
  '.build': 'text/plain',
  '.make': 'text/plain',
  '.cmake': 'text/plain',
}

export function getMimeTypeFromExtension(filename: string): string {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return mimeTypes[extension] || 'application/octet-stream'
}

export function getExtensionFromMimeType(mimeType: string): string {
  // Create reverse mapping
  const reverseMapping: Record<string, string> = {}
  for (const [ext, mime] of Object.entries(mimeTypes)) {
    // Only add if not already in reverse mapping (prefer first match)
    if (!reverseMapping[mime]) {
      reverseMapping[mime] = ext
    }
  }

  // Handle special cases where multiple extensions map to same MIME type
  // Prefer more common extensions
  if (mimeType === 'image/jpeg') return '.jpg'
  if (mimeType === 'text/markdown') return '.md'
  if (mimeType === 'text/html') return '.html'
  if (mimeType === 'application/x-yaml') return '.yaml'
  
  return reverseMapping[mimeType] || ''
}
