import fs from 'fs'
import { Ollama } from 'ollama'

import { transformPdfToImages } from './pdf-to-images'

export const transformPdfToImageToMarkdown = async (filePath: string, imageScale: number = 2.5): Promise<string> => {
  const ollama = new Ollama({
    host: process.env.OLLAMA_BASE_URL,
  })
  const { imageFilePaths } = await transformPdfToImages(filePath, imageScale)

  // Process images sequentially to avoid resource exhaustion
  const responses: string[] = []

  for (let index = 0; index < imageFilePaths.length; index++) {
    const imageFilePath = imageFilePaths[index]
    try {
      const imageBuffer = await fs.promises.readFile(imageFilePath)
      console.log(`Processing image ${index + 1} from PDF: ${imageFilePath}`, imageBuffer.length)

      const response = await ollama.chat({
        model: 'qwen2.5vl:latest',
        stream: false,
        messages: [
          {
            role: 'user',
            content:
              'Please describe the image in detail using markdown. Do not include any code blocks, just return plain markdown text.',
            images: [imageFilePath],
          },
        ],
      })

      if (!response || !response.message || !response.message.content) {
        console.error(`No response or content for image ${index + 1}`)
        responses.push(`# Image Content for Page ${index + 1}\n\nNo response for image ${index + 1}`)
      } else {
        console.log(`Response for image ${index + 1}:`, response.message.content)
        responses.push(`# Image Content for Page ${index + 1}\n\n${response.message.content}`)
      }
    } catch (error) {
      console.error(`Error processing image ${index + 1}:`, error)
      responses.push(`# Image Content for Page ${index + 1}\n\nError processing image: ${(error as Error).message}`)
    }
  }

  const responseMarkdown = responses.join('\n') || 'PDF2Image2Markdown conversion returned no text.'
  console.log(`Rendering PDF response for ${filePath}`, responseMarkdown)
  return responseMarkdown
}
