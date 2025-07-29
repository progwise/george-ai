import fs from 'fs'
import { Ollama } from 'ollama'

import { transformPdfToImages } from './pdf-to-images'

export const transformPdfToImageToMarkdown = async (filePath: string): Promise<string> => {
  const ollama = new Ollama({
    host: process.env.OLLAMA_BASE_URL,
  })
  const { imageFilePaths } = await transformPdfToImages(filePath)

  const responses = await Promise.all(
    imageFilePaths.map(async (imageFilePath, index) => {
      const image = await fs.promises.readFile(imageFilePath)
      console.log(`Processing image ${index + 1} from PDF: ${imageFilePath}`, image.length)
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
        return `# Image Content for Page ${index + 1}\n\nNo response for image ${index + 1}`
      }

      console.log(`Response for image ${index + 1}:`, response.message.content)

      return `# Image Content for Page ${index + 1}\n\n${response.message.content}`
    }),
  )

  const responseMarkdown = responses.join('\n') || 'PDF2Image2Markdown conversion returned no text.'
  console.log(`Rendering PDF response for ${filePath}`, responseMarkdown)
  return responseMarkdown
}
