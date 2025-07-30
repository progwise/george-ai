import fs from 'fs'
import { createRequire } from 'node:module'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

// Convert PDF file to base64 encoded images (one per page)
export async function transformPdfToImages(
  pdfFilePath: string,
  scale: number, // Increase scale for better resolution (2x = 144 DPI, 3x = 216 DPI, 4x = 288 DPI)
): Promise<{ base64Images: string[]; imageFilePaths: string[] }> {
  const require = createRequire(import.meta.url)

  const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.min.mjs')
  GlobalWorkerOptions.workerSrc = workerPath

  // Get paths to cmaps and standard fonts from pdfjs-dist package
  const pdfjsLibFolder = require.resolve('pdfjs-dist').replace('/pdfjs-dist/build/pdf.mjs', '')
  const CMAP_URL = pdfjsLibFolder + '/cmaps/'
  const CMAP_PACKED = true
  const STANDARD_FONT_DATA_URL = pdfjsLibFolder + '/standard_fonts/'

  try {
    const pdfData = new Uint8Array(fs.readFileSync(pdfFilePath))
    const folderPath = pdfFilePath.substring(0, pdfFilePath.lastIndexOf('/'))

    const pdfDocument = await getDocument({
      data: pdfData,
      cMapUrl: CMAP_URL,
      cMapPacked: CMAP_PACKED,
      standardFontDataUrl: STANDARD_FONT_DATA_URL,
    }).promise

    const base64Images: string[] = []
    const imageFilePaths: string[] = []

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum)
      const viewport = page.getViewport({ scale })
      const canvasFactory = pdfDocument.canvasFactory

      // @ts-expect-error - canvasFactory type definition is incomplete
      const canvasAndContext = canvasFactory.create(viewport.width, viewport.height)

      const renderContext = {
        canvasContext: canvasAndContext.context,
        viewport,
      }

      await page.render(renderContext).promise

      // Set DPI metadata in PNG (216 DPI = 8503.9 pixels per meter)
      const dpi = 72 * scale // 72 DPI * scale (3.0)
      const pixelsPerMeter = Math.round(dpi * 39.3701) // Convert DPI to pixels per meter

      const buffer = canvasAndContext.canvas.toBuffer('image/png', {
        resolution: pixelsPerMeter, // This sets the pHYs chunk in PNG
      })
      const imageFilePath = `${folderPath}/page-${pageNum}.png`
      fs.writeFileSync(imageFilePath, buffer)

      imageFilePaths.push(imageFilePath)
      base64Images.push(buffer.toString('base64'))
    }

    return { base64Images, imageFilePaths }
  } catch (error) {
    console.error(`Error converting PDF to images: ${pdfFilePath}`, error)
    throw new Error(`Failed to convert PDF to images: ${(error as Error).message}`)
  }
}

// Convert PDF to images and return as data URLs (for direct use in HTML/Markdown)
export async function convertPdfToImageDataUrls(pdfFilePath: string): Promise<string[]> {
  const { base64Images } = await transformPdfToImages(pdfFilePath, 2.5) // Use a scale of 2.5 for better quality
  return base64Images.map((base64) => `data:image/png;base64,${base64}`)
}
