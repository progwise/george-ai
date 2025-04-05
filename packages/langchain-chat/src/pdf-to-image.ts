import fs from 'fs'
import { createRequire } from 'node:module'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

// import { NodeCanvasFactory } from './pdf-canvas-factory'

// Main conversion function
export async function convertToImages(pdfFilePath: string) {
  const require = createRequire(import.meta.url)

  const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.min.mjs')
  GlobalWorkerOptions.workerSrc = workerPath
  console.log('converting pdf to images', pdfFilePath)
  const pdfData = new Uint8Array(fs.readFileSync(pdfFilePath))

  //const canvasFactory = new NodeCanvasFactory()
  const pdfDocument = await getDocument({
    data: pdfData,
  }).promise

  const pagesAsImagesBase64Strings = []
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
    console.log('rendered page2', canvasAndContext)
    const buffer = canvasAndContext.canvas.toBuffer('image/png')
    pagesAsImagesBase64Strings.push(buffer.toString('base64'))
  }
  return pagesAsImagesBase64Strings
}
