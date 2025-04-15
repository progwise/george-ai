import fs from 'fs'
import { createRequire } from 'node:module'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

// Main conversion function
export async function convertToImages(pdfFilePath: string) {
  const require = createRequire(import.meta.url)

  const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.min.mjs')
  GlobalWorkerOptions.workerSrc = workerPath

  // TODO: use the pdfjs-dist package to get the path to the cmaps and standard fonts, needs to work here and from dist folder.
  const pdfjsLibFolder = require.resolve('pdfjs-dist').replace('/pdfjs-dist/build/pdf.mjs', '')
  const CMAP_URL = pdfjsLibFolder + '/cmaps/'
  const CMAP_PACKED = true

  // Where the standard fonts are located.
  const STANDARD_FONT_DATA_URL = pdfjsLibFolder + '/standard_fonts/'

  console.log('converting pdf to images', pdfFilePath)
  const pdfData = new Uint8Array(fs.readFileSync(pdfFilePath))

  const pdfDocument = await getDocument({
    data: pdfData,
    cMapUrl: CMAP_URL,
    cMapPacked: CMAP_PACKED,
    standardFontDataUrl: STANDARD_FONT_DATA_URL,
  }).promise

  const pagesAsImagesBase64Strings: Array<string> = []
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i)
    const viewport = page.getViewport({ scale: 1.0 })
    const canvasFactory = pdfDocument.canvasFactory
    // eslint-disable-next-line
    // @ts-ignore
    const canvasAndContext = canvasFactory.create(viewport.width, viewport.height)
    const renderContext = {
      canvasContext: canvasAndContext.context,
      viewport,
    }
    await page.render(renderContext).promise
    const buffer = canvasAndContext.canvas.toBuffer('image/png')
    pagesAsImagesBase64Strings.push(buffer.toString('base64'))
  }
  return pagesAsImagesBase64Strings
}
