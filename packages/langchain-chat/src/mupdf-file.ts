import * as mupdfjs from 'mupdf/mupdfjs'

import { getFileExtension } from './common'

export async function loadMuPDFFile(file: { name: string; id: string; mimeType: string; path: string }) {
  console.log('Using MuPDF to parse PDF:', file.path)
  const pdf = await mupdfjs.PDFDocument.openDocument(file.path)
  const pageCount = pdf.countPages()
  console.log(`MuPDF found ${pageCount} pages for ${file.name}`)

  const docParts = []
  for (let i = 0; i < pageCount; i++) {
    const page = await pdf.loadPage(i)
    const text = await page.getText()
    docParts.push({
      pageContent: text || '',
      metadata: {
        pageIndex: i,
        docType: getFileExtension(file.mimeType),
        docName: file.name,
        points: 1,
        docId: file.id,
      },
    })
  }

  await pdf.close()
  return docParts
}
