import fs from 'fs'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

// Main conversion function
export async function convertToImages(pdfFilePath: string) {
  console.log('converting pdf to images', pdfFilePath)
  const pdfData = new Uint8Array(fs.readFileSync(pdfFilePath))

  const pdfDocument = await getDocument({
    data: pdfData,
    disableFontFace: true,
    verbosity: 0,
  }).promise

  const canvasFactory = pdfDocument.canvasFactory

  const pagesAsImagesBase64Strings = []
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i)
    const viewport = page.getViewport({ scale: 1.0 })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
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
