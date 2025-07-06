import fs from 'fs'
import { createRequire } from 'node:module'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

// Convert PDF file to base64 encoded images (one per page)
export async function transformPdfToImages(pdfFilePath: string): Promise<string[]> {
  const require = createRequire(import.meta.url)

  const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.min.mjs')
  GlobalWorkerOptions.workerSrc = workerPath

  // Get paths to cmaps and standard fonts from pdfjs-dist package
  const pdfjsLibFolder = require.resolve('pdfjs-dist').replace('/pdfjs-dist/build/pdf.mjs', '')
  const CMAP_URL = pdfjsLibFolder + '/cmaps/'
  const CMAP_PACKED = true
  const STANDARD_FONT_DATA_URL = pdfjsLibFolder + '/standard_fonts/'

  console.log('Converting PDF to images:', pdfFilePath)

  try {
    const pdfData = new Uint8Array(fs.readFileSync(pdfFilePath))

    const pdfDocument = await getDocument({
      data: pdfData,
      cMapUrl: CMAP_URL,
      cMapPacked: CMAP_PACKED,
      standardFontDataUrl: STANDARD_FONT_DATA_URL,
    }).promise

    const pagesAsImagesBase64: string[] = []

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum)
      const viewport = page.getViewport({ scale: 1.0 })
      const canvasFactory = pdfDocument.canvasFactory

      // @ts-expect-error - canvasFactory type definition is incomplete
      const canvasAndContext = canvasFactory.create(viewport.width, viewport.height)

      const renderContext = {
        canvasContext: canvasAndContext.context,
        viewport,
      }

      await page.render(renderContext).promise

      const buffer = canvasAndContext.canvas.toBuffer('image/png')
      pagesAsImagesBase64.push(buffer.toString('base64'))
    }

    return pagesAsImagesBase64
  } catch (error) {
    console.error(`Error converting PDF to images: ${pdfFilePath}`, error)
    throw new Error(`Failed to convert PDF to images: ${(error as Error).message}`)
  }
}

// Convert PDF to images and return as data URLs (for direct use in HTML/Markdown)
export async function convertPdfToImageDataUrls(pdfFilePath: string): Promise<string[]> {
  const base64Images = await transformPdfToImages(pdfFilePath)
  return base64Images.map((base64) => `data:image/png;base64,${base64}`)
}
