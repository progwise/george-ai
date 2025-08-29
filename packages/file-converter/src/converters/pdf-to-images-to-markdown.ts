import { type AIResponse, chat } from '@george-ai/ai-service-client'

import { transformPdfToImages } from './pdf-to-images.js'
import { ConverterResult } from './types.js'

const MAX_CONCURRENT_PAGES = 2 // Maximum pages to process in parallel per PDF

export const transformPdfToImageToMarkdown = async (
  filePath: string,
  timeoutSignal: AbortSignal,
  imageScale: number,
  ocrPrompt: string,
  ocrModel: string,
  ocrTimeoutPerPage: number, // in milliseconds
): Promise<ConverterResult> => {
  const { base64Images, imageFilePaths } = await transformPdfToImages(filePath, imageScale)

  console.log(
    `Processing ${base64Images.length} images with model ${ocrModel}, timeout per page ${ocrTimeoutPerPage}ms, max concurrent: ${MAX_CONCURRENT_PAGES}`,
  )

  // Store responses in order
  const responses: (string | null)[] = new Array(base64Images.length).fill(null)
  const pageResults: Array<{
    page: number
    issues?: AIResponse['issues']
    metadata?: AIResponse['metadata']
  }> = new Array(base64Images.length)
  let errorPages = 0
  let hasGlobalIssues = false
  const globalIssues: AIResponse['issues'] = { timeout: false, partialResult: false }

  const startTime = Date.now()

  // Process pages in batches of MAX_CONCURRENT_PAGES
  for (let i = 0; i < base64Images.length; i += MAX_CONCURRENT_PAGES) {
    if (timeoutSignal.aborted) {
      console.error(`❌ PDF to Images to Markdown conversion aborted due to callers timeout`)
      return {
        markdownContent: responses.filter((r) => r !== null).join('\n\n'),
        partialResult: true,
        timeout: true,
        processingTimeMs: Date.now() - startTime,
        metadata: {
          totalPages: base64Images.length,
          processedPages: i,
          errorPages,
          pageResults: pageResults.slice(0, i),
        },
      }
    }
    const batch = base64Images.slice(i, i + MAX_CONCURRENT_PAGES)
    const batchPromises = batch.map(async (base64Image, batchIndex) => {
      const index = i + batchIndex
      const pageNumber = index + 1

      try {
        console.log(`Processing image ${pageNumber} from PDF: ${imageFilePaths[index]}`)

        const response = await chat({
          model: ocrModel,
          messages: [
            {
              role: 'user',
              content: ocrPrompt,
              images: [base64Image],
            },
          ],
          timeout: ocrTimeoutPerPage,
          onChunk: (chunk) => {
            if (chunk.length > 50) {
              console.log(`Processing page ${pageNumber}...`, chunk.substring(0, 50) + '...')
            }
          },
        })

        // Check for specific issues
        if (response.issues?.timeout || response.issues?.partialResult) {
          console.warn(`Page ${pageNumber} processed with issues:`, response.issues)

          const issueNote = response.issues.timeout
            ? '*Note: Processing timed out*'
            : response.issues.partialResult
              ? '*Note: Processing completed with partial result*'
              : '*Note: Processing completed with issues*'

          responses[index] = `# Image Content for Page ${pageNumber}\n\n${response.content}\n\n${issueNote}`
          pageResults[index] = {
            page: pageNumber,
            issues: response.issues,
            metadata: response.metadata,
          }

          // Track global issues
          hasGlobalIssues = true
          if (response.issues.timeout) globalIssues.timeout = true
          if (response.issues.partialResult) globalIssues.partialResult = true
        } else {
          console.log(`Successfully processed page ${pageNumber}`)
          responses[index] = `# Image Content for Page ${pageNumber}\n\n${response.content}`
          pageResults[index] = { page: pageNumber, metadata: response.metadata }
        }
      } catch (error) {
        console.error(`Error processing image ${pageNumber}:`, error)
        errorPages++
        responses[index] =
          `# Image Content for Page ${pageNumber}\n\nError processing image: ${(error as Error).message}`
        pageResults[index] = { page: pageNumber }
      }
    })

    // Wait for batch to complete before starting next batch
    await Promise.all(batchPromises)
  }

  const processingTime = Date.now() - startTime
  const responseMarkdown = responses.join('\n\n') || 'PDF2Image2Markdown conversion returned no text.'

  console.log(`Completed PDF processing for ${filePath}`, {
    totalPages: base64Images.length,
    processedPages: base64Images.length - errorPages,
    errorPages,
    processingTime,
    hasGlobalIssues,
  })

  return {
    markdownContent: responseMarkdown,
    partialResult: globalIssues.partialResult || errorPages > 0,
    timeout: globalIssues.timeout,
    processingTimeMs: processingTime,
    metadata: {
      totalPages: base64Images.length,
      processedPages: base64Images.length - errorPages,
      errorPages,
      pageResults,
    },
  }
}
