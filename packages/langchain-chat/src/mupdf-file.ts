import { PDFDocument } from 'mupdf'

import { getFileExtension } from './common'

import fs from 'fs/promises'

export interface MuPDFInputFile {
  id: string
  name: string
  mimeType: string
  path: string
}

interface IMuPDFPage {
  getText(): Promise<string>
}

interface IMuPDFDocument {
  loadPage(pageIndex: number): IMuPDFPage
  countPages(): number
  close(): Promise<void>
}

export interface MuPDFDocumentPart {
  pageContent: string
  metadata: {
    pageIndex: number
    docType: string
    docName: string
    points: number
    docId: string
  }
}

export class MuPDFLoader {
  constructor(private file: MuPDFInputFile) {}

  async load(): Promise<MuPDFDocumentPart[]> {
    const data = await fs.readFile(this.file.path)
    const pdf = PDFDocument.openDocument(data, 'pdf') as unknown as IMuPDFDocument
    const pageCount = pdf.countPages()
    const docParts: MuPDFDocumentPart[] = []

    for (let i = 0; i < pageCount; i++) {
      const page = pdf.loadPage(i)
      const text = await page.getText()
      docParts.push({
        pageContent: text ?? '',
        metadata: {
          pageIndex: i,
          docType: getFileExtension(this.file.mimeType),
          docName: this.file.name,
          points: 1,
          docId: this.file.id,
        },
      })
    }

    await pdf.close()
    return docParts
  }
}
