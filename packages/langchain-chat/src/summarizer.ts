import { OpenAI } from '@langchain/openai'

const model = new OpenAI({ modelName: 'gpt-4', temperature: 0.3 })

export const summarizeDocument = async (text: string): Promise<string> => {
  const prompt = `Summarize the following document:

${text}`
  const result = await model.invoke(prompt)
  return result.trim()
}
