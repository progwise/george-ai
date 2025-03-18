import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { TextLoader } from 'langchain/document_loaders/fs/text'

import { getFileExtension } from './common'
import { loadMuPDFFile } from './mupdf-file'

export const loadFile = async (file: { name: string; id: string; mimeType: string; path: string }) => {
  switch (file.mimeType) {
    case 'application/pdf': {
      const docParts = await loadMuPDFFile(file)
      return docParts.map((part) => ({
        pageContent: part.pageContent,
        id: file.id,
        metadata: part.metadata,
      }))
    }

    case 'text/plain': {
      const loader = new TextLoader(file.path)
      const parts = await loader.load()
      return parts.map((p) => ({
        pageContent: p.pageContent,
        id: file.id,
        metadata: {
          ...p.metadata,
          docType: getFileExtension(file.mimeType),
          docName: file.name,
          points: 1,
          docId: file.id,
        },
      }))
    }

    case 'text/csv': {
      const loader = new CSVLoader(file.path)
      const parts = await loader.load()
      return parts.map((p) => ({
        pageContent: p.pageContent,
        id: file.id,
        metadata: {
          ...p.metadata,
          docType: getFileExtension(file.mimeType),
          docName: file.name,
          points: 1,
          docId: file.id,
        },
      }))
    }

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      const loader = new DocxLoader(file.path)
      const parts = await loader.load()
      return parts.map((p) => ({
        pageContent: p.pageContent,
        id: file.id,
        metadata: {
          ...p.metadata,
          docType: getFileExtension(file.mimeType),
          docName: file.name,
          points: 1,
          docId: file.id,
        },
      }))
    }

    default:
      throw new Error(`Unsupported mime type ${file.mimeType} for file ${file.name}`)
  }
}
