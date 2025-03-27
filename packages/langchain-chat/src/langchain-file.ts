import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { Document } from 'langchain/document'
import { TextLoader } from 'langchain/document_loaders/fs/text'

import { getFileExtension } from './common'
import { MuPDFInputFile, MuPDFLoader } from './mupdf-file'

export interface GenericFile {
  name: string
  id: string
  mimeType: string
  path: string
}

const documentPart = (raw: Document, file: GenericFile) => {
  return {
    pageContent: raw.pageContent,
    id: file.id,
    metadata: {
      ...raw.metadata,
      docType: getFileExtension(file.mimeType),
      docName: file.name,
      points: 1,
      docId: file.id,
    },
  }
}

export const loadFile = async (file: GenericFile) => {
  switch (file.mimeType) {
    case 'application/pdf': {
      const loader = new MuPDFLoader(file as MuPDFInputFile)
      const docParts = await loader.load()
      return docParts
    }

    case 'text/plain': {
      const loader = new TextLoader(file.path)
      const docs = await loader.load()
      return docs.map((d) => documentPart(d, file))
    }

    case 'text/csv': {
      const loader = new CSVLoader(file.path)
      const docs = await loader.load()
      return docs.map((d) => documentPart(d, file))
    }

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      const loader = new DocxLoader(file.path)
      const docs = await loader.load()
      return docs.map((d) => documentPart(d, file))
    }

    default:
      throw new Error(`Unsupported mime type ${file.mimeType} for file ${file.name}`)
  }
}
