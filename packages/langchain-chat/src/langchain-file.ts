import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import { getFileExtension } from './common'

export const loadFile = async (file: {
  name: string
  id: string
  mimeType: string
  blob: Blob
}) => {
  let documentLoader
  switch (file.mimeType) {
    case 'application/pdf':
      documentLoader = new PDFLoader(file.blob)
      break
    case 'text/plain':
      documentLoader = new TextLoader(file.blob)
      break
    case 'text/csv':
      documentLoader = new CSVLoader(file.blob)
      break
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      documentLoader = new DocxLoader(file.blob)
      break
    default:
      throw new Error(
        `Unsupported mime type ${file.mimeType} for file ${file.name}`,
      )
  }

  const documentParts = await documentLoader.load()

  return documentParts.map((documentPart) => ({
    pageContent: documentPart.pageContent,
    id: file.id,
    metadata: {
      ...documentPart.metadata,
      docType: getFileExtension(file.mimeType),
      docName: file.name,
      points: 1,
      docId: file.id,
    },
  }))
}
