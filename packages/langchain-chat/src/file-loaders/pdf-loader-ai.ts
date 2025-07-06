import { TextLoader } from 'langchain/document_loaders/fs/text'
import OpenAI from 'openai'
import { ResponseInputImage } from 'openai/resources/responses/responses'

import { transformPdfToImages } from '@george-ai/file-converter'

export class PDFLoaderAI {
  constructor(private filePath: string) {}

  async load() {
    console.log(`Loading PDF file with AI from ${this.filePath}`)

    const client = new OpenAI()
    const convertedImages = await transformPdfToImages(this.filePath)

    const images = convertedImages.map(
      (image) =>
        ({
          type: 'input_image',
          image_url: `data:image/png;base64,${image}`,
        }) as ResponseInputImage,
    )

    const response = await client.responses.create({
      model: 'o4-mini',
      input: [
        {
          role: 'system',
          content: 'You are a helpful assistant that can read text in images.',
        },
        {
          role: 'user',
          content: [
            ...images,
            {
              type: 'input_text',
              text: `I have created some images from a PDF document to have a general purpose format for the document.
              The images are in the same order as the pages of the PDF document.
              I want you to read the document carefully and write the text in the same order as it is in the images.
              I need you to give me the text you can read from the images.
              You should also describe the layout and non-text elements of the images.
              The text you deliver will be used by myself to create a searchable index of the document.
              Please do not include any other information or comments in your response that is not written in the images.
              The goal is to extract the text word for word and describe the document as it is.
              Please format your response as markdown text, with each page's content separated by a horizontal rule.
              Do not include any additional explanations or comments.`,
            },
          ],
        },
      ],
    })

    console.log(`Rendering PDF response for ${this.filePath}`, response.output_text)
    const textLoader = new TextLoader(new Blob([response.output_text]))

    return await textLoader.load()
  }
}
