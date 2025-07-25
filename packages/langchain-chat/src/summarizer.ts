import { getModel } from './assistant-model'

export const summarizeDocument = async (text: string): Promise<string> => {
  const model = await getModel('llama3.1:latest')

  const prompt = `Summarize the following document in a clear and concise manner:

${text}

Provide a comprehensive summary that captures the main points and key information.`

  const result = await model.invoke(prompt)
  return result.content.toString().trim()
}
