import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { TextLoader } from 'langchain/document_loaders/fs/text'

import { getFileExtension } from './common'
import { ExcelLoader } from './file-loaders/excel-loader'

// import { PDFLoaderAI } from './pdf-loader-ai'

export const loadFile = async (file: { name: string; id: string; mimeType: string; path: string }) => {
  let documentLoader
  switch (file.mimeType) {
    case 'application/pdf':
      // documentLoader = new PDFLoaderAI(file.path)
      documentLoader = new PDFLoader(file.path)
      break
    case 'text/plain':
    case 'text/markdown':
      documentLoader = new TextLoader(file.path)
      break
    case 'text/csv':
      documentLoader = new CSVLoader(file.path)
      break
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      documentLoader = new DocxLoader(file.path)
      break
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      documentLoader = new ExcelLoader(file.path)
      break
    default:
      throw new Error(`Unsupported mime type in loadFile ${file.mimeType} for file ${file.name}`)
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
