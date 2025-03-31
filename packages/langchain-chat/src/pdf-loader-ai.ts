import { TextLoader } from 'langchain/document_loaders/fs/text'
import OpenAI from 'openai'
import { ResponseInputImage } from 'openai/resources/responses/responses'

import { convertToImages } from './pdf-to-image'

export class PDFLoaderAI {
  constructor(private filePath: string) {}

  async load() {
    const client = new OpenAI()
    const convertedImages = await convertToImages(this.filePath)

    const images = convertedImages.map(
      (image) =>
        ({
          type: 'input_image',
          image_url: `data:image/png;base64,${image}`,
        }) as ResponseInputImage,
    )

    const response = await client.responses.create({
      model: 'gpt-4o',
      input: [
        {
          role: 'system',
          content: 'You are a helpful assistant that can summarize text and images.',
        },
        {
          role: 'user',
          content: [
            ...images,
            {
              type: 'input_text',
              text: `Can you summarize what you can see in the attached images?
              The images have been converted from a pdf file in advance.
              Each original page was converted into a separate image.`,
            },
          ],
        },
      ],
    })

    const textLoader = new TextLoader(new Blob([response.output_text]))

    return await textLoader.load()
  }
}
