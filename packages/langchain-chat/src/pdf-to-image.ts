import fs from 'fs'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

// Main conversion function
export async function convertToImages(pdfFilePath: string) {
  console.log('pdfFilePath', pdfFilePath)
  const pdfData = new Uint8Array(fs.readFileSync(pdfFilePath))

  const pdfDocument = await getDocument({
    data: pdfData,
    disableFontFace: true,
    verbosity: 0,
  }).promise

  const canvasFactory = pdfDocument.canvasFactory

  console.log('pdfDocument numPages', pdfDocument.numPages)
  const pagesAsImagesBase64Strings = []
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    console.log('processingpage', i)
    const page = await pdfDocument.getPage(i)
    console.log('got page', i)
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
    console.log('buffer', buffer.toString('base64'))
    pagesAsImagesBase64Strings.push(buffer.toString('base64'))
  }
  return pagesAsImagesBase64Strings
}
