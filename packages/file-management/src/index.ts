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
