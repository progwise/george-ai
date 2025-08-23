import { type AIResponse, chat } from '@george-ai/ai-service-client'

import { getFileConverterOptionValueWithDefault } from '../file-converter-options.js'
import { transformPdfToImages } from './pdf-to-images.js'

const DEFAULT_OCR_PROMPT = `Please give me the content of this image as markdown structured as follows:
Short summary what you see in the image
List all visual blocks with a headline and its content
Return plain and well structured Markdown. Do not repeat information.`

export interface PdfToMarkdownResult {
  content: string
  issues?: AIResponse['issues']
  metadata?: {
    totalPages: number
    processedPages: number
    errorPages: number
    processingTime: number
    pageResults: Array<{
      page: number
      success: boolean
      issues?: AIResponse['issues']
      metadata?: AIResponse['metadata']
    }>
  }
}

export const transformPdfToImageToMarkdown = async (
  filePath: string,
  imageScale: number = 3.0,
  fileConverterOptions?: string,
): Promise<PdfToMarkdownResult> => {
  const { base64Images, imageFilePaths } = await transformPdfToImages(filePath, imageScale)

  // Extract configuration from file converter options
  const prompt = getFileConverterOptionValueWithDefault(fileConverterOptions, 'ocrPrompt') || DEFAULT_OCR_PROMPT
  const model = getFileConverterOptionValueWithDefault(fileConverterOptions, 'ocrModel') || 'qwen2.5vl:latest'
  const timeoutStr = getFileConverterOptionValueWithDefault(fileConverterOptions, 'ocrTimeout') || '120'
  const loopThresholdStr =
    getFileConverterOptionValueWithDefault(fileConverterOptions, 'ocrLoopDetectionThreshold') || '5'

  const timeout = parseInt(timeoutStr, 10) * 1000 // Convert to milliseconds
  const loopThreshold = parseInt(loopThresholdStr, 10)

  console.log(
    `Processing ${base64Images.length} images with model ${model}, timeout ${timeout}ms, loop threshold ${loopThreshold}`,
  )

  // Process images sequentially to avoid resource exhaustion
  const responses: string[] = []
  const pageResults: Array<{
    page: number
    success: boolean
    issues?: AIResponse['issues']
    metadata?: AIResponse['metadata']
  }> = []
  let errorPages = 0
  let hasGlobalIssues = false
  const globalIssues: AIResponse['issues'] = {}

  const startTime = Date.now()

  for (let index = 0; index < base64Images.length; index++) {
    const base64Image = base64Images[index]
    const pageNumber = index + 1

    try {
      console.log(`Processing image ${pageNumber} from PDF: ${imageFilePaths[index]}`, base64Image.length)

      const response = await chat({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
            images: [base64Image],
          },
        ],
        maxAllowedRepetitions: loopThreshold > 0 ? loopThreshold : undefined,
        timeout,
        onChunk: (chunk) => {
          if (chunk.length > 50) {
            console.log(`Processing page ${pageNumber}...`, chunk.substring(0, 50) + '...')
          }
        },
      })

      if (response.success) {
        console.log(`Successfully processed page ${pageNumber}`)
        responses.push(`# Image Content for Page ${pageNumber}\n\n${response.content}`)
        pageResults.push({ page: pageNumber, success: true, metadata: response.metadata })
      } else {
        console.warn(`Page ${pageNumber} processed with issues:`, response.issues)
        responses.push(
          `# Image Content for Page ${pageNumber}\n\n${response.content}\n\n*Note: Processing completed with ${
            response.issues?.endlessLoop ? 'endless loop detected' : 'timeout'
          }*`,
        )
        pageResults.push({ page: pageNumber, success: false, issues: response.issues, metadata: response.metadata })

        // Track global issues (if any page has issues, the whole conversion has issues)
        hasGlobalIssues = true
        if (response.issues?.endlessLoop) globalIssues.endlessLoop = true
        if (response.issues?.timeout) globalIssues.timeout = true
        if (response.issues?.partialResult) globalIssues.partialResult = true
      }
    } catch (error) {
      console.error(`Error processing image ${pageNumber}:`, error)
      errorPages++
      responses.push(`# Image Content for Page ${pageNumber}\n\nError processing image: ${(error as Error).message}`)
      pageResults.push({ page: pageNumber, success: false })
    }
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
    content: responseMarkdown,
    issues: hasGlobalIssues ? globalIssues : undefined,
    metadata: {
      totalPages: base64Images.length,
      processedPages: base64Images.length - errorPages,
      errorPages,
      processingTime,
      pageResults,
    },
  }
}
