import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })

export const generateGeminiEmbeddings = async (
  text: string,
): Promise<number[]> => {
  try {
    const result = await model.embedContent(text)
    return result.embedding.values
  } catch (error) {
    console.error('Error generating Gemini embeddings:', error)
    throw new Error('Failed to generate embeddings with Gemini API')
  }
}
