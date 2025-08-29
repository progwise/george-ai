import fs from 'fs'
import path from 'node:path'

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

export const fileDirExists = (fileId: string, libraryId: string) => {
  const libraryDir = getLibraryDir(libraryId)
  const fileDir = `${libraryDir}/${fileId}`
  return fs.existsSync(fileDir)
}

export const fileDirIsEmpty = async (fileId: string, libraryId: string) => {
  if (!fileDirExists(fileId, libraryId)) {
    return true
  }
  const fileDir = getFileDir({ fileId, libraryId })
  const files = await fs.promises.readdir(fileDir)
  return files.length === 0
}

export const deleteFileDir = async (fileId: string, libraryId: string) => {
  const fileDir = getFileDir({ fileId, libraryId, errorIfNotExists: true })
  await fs.promises.rm(fileDir, { recursive: true, force: true })
}

export const getUploadFilePath = ({ fileId, libraryId }: { fileId: string; libraryId: string }) => {
  const fileDir = getFileDir({ fileId, libraryId })
  return `${fileDir}/upload`
}

export const generateTimestamp = (): string => {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, '_').replace('T', '_').slice(0, -5) // Remove milliseconds and 'Z'
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
    timestamp: ts,
  }
}

export const saveMarkdownContent = async (
  fileId: string,
  libraryId: string,
  extractionMethod: string,
  markdownContent: string,
): Promise<string> => {
  const fileName = `${fileId}_${extractionMethod}_${Date.now()}.md`
  const fileDir = getFileDir({ fileId, libraryId })
  const filePath = path.join(fileDir, fileName)

  await fs.promises.writeFile(filePath, markdownContent, 'utf-8')

  return fileName
}

export const readMarkdownContent = async (
  fileId: string,
  libraryId: string,
  extractionMethod: string,
): Promise<string> => {
  const fileDir = getFileDir({ fileId, libraryId })
  const files = await fs.promises.readdir(fileDir)
  const markdownFiles = files
    .filter((file) => file.endsWith('.md') && file.includes(`_${extractionMethod}_`))
    .sort((a, b) => {
      const aTime = fs.statSync(path.join(fileDir, a)).mtime.getTime()
      const bTime = fs.statSync(path.join(fileDir, b)).mtime.getTime()
      return bTime - aTime // Newest first
    })

  if (markdownFiles.length === 0) {
    throw new Error('No markdown files found for the specified extraction method')
  }

  const latestFilePath = path.join(fileDir, markdownFiles[0])
  return fs.promises.readFile(latestFilePath, 'utf-8')
}
