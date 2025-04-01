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
          content: 'You are a helpful assistant that can read text in images.',
        },
        {
          role: 'user',
          content: [
            ...images,
            {
              type: 'input_text',
              text: `Can you write as formatted text exactly what you can see in the attached images?
              The images have been converted from a pdf file in advance to read the content completely no matter of the orientation of the text or if the text is upside down.
              You must write the text in the same order as it is in the images.
              Each original page from the pdf file was converted into a separate image. Please mention the page number in the text.
              You are not allowed to add any additional text. Please be careful and just repeat the text as it is in the images.
              Please also describe the images without any additional text.`,
            },
          ],
        },
      ],
    })

    console.log('response', response.output_text)
    const textLoader = new TextLoader(new Blob([response.output_text]))

    return await textLoader.load()
  }
}
