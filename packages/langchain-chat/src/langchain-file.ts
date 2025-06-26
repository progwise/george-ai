import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { TextLoader } from 'langchain/document_loaders/fs/text'

import { getFileExtension } from './common'
import { ExcelLoader } from './file-loaders/excel-loader'
import { PDFLoaderAI } from './file-loaders/pdf-loader-ai'

export const loadFile = async (
  file: {
    name: string
    id: string
    mimeType: string
    path: string
    originUri: string
  },
  retry?: boolean,
) => {
  let documentLoader
  if (file.mimeType.includes('application/pdf') && retry) {
    console.log(`Fallback: Retrying PDF loading for ${file.path} with AI loader`)
    documentLoader = new PDFLoaderAI(file.path)
  } else {
    switch (file.mimeType) {
      case 'application/pdf':
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
      docPath: file.path,
      originUri: file.originUri,
    },
  }))
}
