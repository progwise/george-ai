import fs from 'fs'

export const getUploadsDir = () => {
  const dir = process.env.UPLOADS_PATH || './uploads'
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

export const getLibraryDir = (libraryId: string) => {
  const uploadsDir = getUploadsDir()
  const libraryDir = `${uploadsDir}/${libraryId}`
  if (!fs.existsSync(libraryDir)) {
    fs.mkdirSync(libraryDir, { recursive: true })
  }
  return libraryDir
}

export const getFileDir = ({
  fileId,
  libraryId,
  errorIfNotExists = false,
}: {
  fileId: string
  libraryId: string
  errorIfNotExists?: boolean
}) => {
  const libraryDir = getLibraryDir(libraryId)
  const fileDir = `${libraryDir}/${fileId}`
  if (fs.existsSync(fileDir)) {
    return fileDir
  } else if (errorIfNotExists) {
    throw new Error('Directory does not exist')
  }
  fs.mkdirSync(fileDir, { recursive: true })
  return fileDir
}

export const getUploadFilePath = ({ fileId, libraryId }: { fileId: string; libraryId: string }) => {
  const fileDir = getFileDir({ fileId, libraryId })
  return `${fileDir}/upload`
}

export const getMarkdownFilePath = ({
  fileId,
  libraryId,
  errorIfNotExists = false,
}: {
  fileId: string
  libraryId: string
  errorIfNotExists?: boolean
}) => {
  const fileDir = getFileDir({ fileId, libraryId, errorIfNotExists })
  return `${fileDir}/converted.md`
}

export const generateTimestamp = (): string => {
  const now = new Date()
  return now.toISOString()
    .replace(/[:.]/g, '_')
    .replace('T', '_')
    .slice(0, -5) // Remove milliseconds and 'Z'
}

export const getTimestampedMarkdownFilePath = ({
  fileId,
  libraryId,
  timestamp,
}: {
  fileId: string
  libraryId: string
  timestamp?: string
}) => {
  const fileDir = getFileDir({ fileId, libraryId })
  const ts = timestamp || generateTimestamp()
  return {
    filePath: `${fileDir}/converted_${ts}.md`,
    fileName: `converted_${ts}.md`,
    timestamp: ts
  }
}

export const getLatestMarkdownFilePath = async ({
  fileId,
  libraryId,
}: {
  fileId: string
  libraryId: string
}): Promise<string | null> => {
  const fileDir = getFileDir({ fileId, libraryId, errorIfNotExists: true })
  
  try {
    const files = await fs.promises.readdir(fileDir)
    const markdownFiles = files
      .filter(file => file.startsWith('converted_') && file.endsWith('.md'))
      .sort((a, b) => b.localeCompare(a)) // Sort by timestamp descending (newest first)
    
    if (markdownFiles.length > 0) {
      return `${fileDir}/${markdownFiles[0]}`
    }
    
    // Fallback to legacy converted.md for backward compatibility
    const legacyPath = `${fileDir}/converted.md`
    if (fs.existsSync(legacyPath)) {
      return legacyPath
    }
    
    return null
  } catch {
    return null
  }
}

