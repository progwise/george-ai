import { getMimeTypeFromExtension } from './mimetype-mapping'

export const getMimeTypeFromFileName = (fileName: string) => {
  return getMimeTypeFromExtension(fileName.trim())
}
