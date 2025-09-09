import { ollamaChat } from '@george-ai/ai-service-client'

import { transformPdfToImages } from './pdf-to-images.js'
import { ConverterResult } from './types.js'

// Concurrency is now dynamically managed by OLLAMA resource manager based on GPU memory

export const transformPdfToImageToMarkdown = async (
  filePath: string,
  timeoutSignal: AbortSignal,
  imageScale: number,
  ocrPrompt: string,
  ocrModel: string,
  ocrTimeoutPerPage: number, // in milliseconds
): Promise<ConverterResult> => {
  const { base64Images, imageFilePaths } = await transformPdfToImages(filePath, imageScale)

  const startTime = Date.now()

  // Process all pages concurrently - OLLAMA resource manager handles throttling
  const pagePromises = base64Images.map(async (base64Image, index) => {
    const pageNumber = index + 1

    if (timeoutSignal.aborted) {
      return { index, aborted: true }
    }

    try {
      console.log(`Processing image ${pageNumber} from PDF: ${imageFilePaths[index]}`)

      const response = await ollamaChat({
        model: ocrModel,
        messages: [
          {
            role: 'user',
            content: ocrPrompt,
            images: [base64Image],
          },
        ],
        timeout: ocrTimeoutPerPage,
        abortSignal: timeoutSignal,
      })

      return { index, response }
    } catch (error) {
      console.error(`Error starting image processing ${pageNumber} file ${filePath}:`, error)
      return { index, error: error as Error }
    }
  })

  // Wait for all pages to complete or fail
  const results = await Promise.all(pagePromises)

  const errorPages = results.filter(
    (result) => result.aborted || result.error || result.error || (result.response && !result.response.success),
  )

  return {
    markdownContent: results
      .map((result) => `# Page ${result.index} \n\n` + result.response?.content || '')
      .join('\n\n'),
    partialResult: errorPages.length > 0,
    timeout: timeoutSignal.aborted,
    processingTimeMs: Date.now() - startTime,
    metadata: {
      results: results.map((result) => ({
        pageIndex: result.index,
        success: !!(result.response && result.response.success),
        aborted: !!result.aborted,
        error: result.error,
        tokensProcessed: result.response?.metadata?.tokensProcessed,
        timeElapsedMs: result.response?.metadata?.timeElapsed,
        instanceUrl: result.response?.metadata?.instanceUrl,
      })),
      totalPages: base64Images.length,
      processedPages: base64Images.length - errorPages.length,
      errorPages,
    },
    success: errorPages.length === 0 && !timeoutSignal.aborted,
  }
}
