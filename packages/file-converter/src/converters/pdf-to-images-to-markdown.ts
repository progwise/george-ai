import { Ollama } from 'ollama'

import { transformPdfToImages } from './pdf-to-images'

export const transformPdfToImageToMarkdown = async (filePath: string): Promise<string> => {
  const ollama = new Ollama({
    host: process.env.OLLAMA_BASE_URL,
  })
  const convertedImages = await transformPdfToImages(filePath)

  const images = convertedImages.map((image) => `${image}`)

  const response = await ollama.generate({
    model: 'qwen2.5vl:latest',
    system:
      'You are a helpful assistant that can write detailed descriptions of images. You must analyze the images and write a detailed description of each image in markdown format.',
    images,
    prompt: `I have created some images from a PDF document to have a general purpose format for the document.
              The images are in the same order as the pages of the PDF document.
              I want you to read the document carefully and write the text in the same order as it is in the images.
              I need you to give me the text you can read from the images.
              You should also describe the layout and non-text elements of the images.
              The text you deliver will be used by myself to create a searchable index of the document.
              Please do not include any other information or comments in your response that is not written in the images.
              The goal is to extract the text word for word and describe the document as it is.
              Please format your response as markdown text, with each page's content separated by a horizontal rule.
              Do not include any additional explanations or comments.
              Format your response as markdown text, with each page's content separated by a horizontal rule.`,
  })

  const responseMarkdown = response.response || 'PDF2Image2Markdown conversion returned no text.'
  console.log(`Rendering PDF response for ${filePath}`, responseMarkdown)
  return responseMarkdown
}
