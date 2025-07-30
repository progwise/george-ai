import { transformPdfToImages } from './pdf-to-images'

export const transformPdfToImageToMarkdown = async (filePath: string, imageScale: number = 3.0): Promise<string> => {
  const { base64Images, imageFilePaths } = await transformPdfToImages(filePath, imageScale)

  // Process images sequentially to avoid resource exhaustion
  const responses: string[] = []

  for (let index = 0; index < base64Images.length; index++) {
    const base64Image = base64Images[index]
    try {
      // const imageBuffer = await fs.promises.readFile(imageFilePath)
      console.log(`Processing image ${index + 1} from PDF: ${imageFilePaths[index]}`, base64Image.length)

      // Bypass Ollama client and use direct HTTP request like OpenWebUI
      const httpResponse = await fetch(`${process.env.OLLAMA_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen2.5vl:latest',
          stream: false,
          messages: [
            {
              role: 'user',
              content:
                'Please describe the image in detail using markdown. Do not include any code blocks, just return plain markdown text.',
              images: [base64Image], // Clean base64 string without data URL prefix
            },
          ],
        }),
      })

      if (!httpResponse.ok) {
        const response = await httpResponse.json()
        throw new Error(
          `HTTP ${httpResponse.status}: ${httpResponse.statusText} \nResponse: ${JSON.stringify(response)}`,
        )
      }

      const response = (await httpResponse.json()) as { message?: { content?: string } }

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
