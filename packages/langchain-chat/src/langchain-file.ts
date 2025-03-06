import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { TextLoader } from 'langchain/document_loaders/fs/text'

import { getFileExtension } from './common'

export const loadFile = async (file: { name: string; id: string; mimeType: string; path: string }) => {
  let documentLoader
  switch (file.mimeType) {
    case 'application/pdf':
      documentLoader = new PDFLoader(file.path)
      break
    case 'text/plain':
      documentLoader = new TextLoader(file.path)
      break
    case 'text/csv':
      documentLoader = new CSVLoader(file.path)
      break
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      documentLoader = new DocxLoader(file.path)
      break
    default:
      throw new Error(`Unsupported mime type ${file.mimeType} for file ${file.name}`)
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
