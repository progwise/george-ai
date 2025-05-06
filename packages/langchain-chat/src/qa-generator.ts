import { OpenAI } from '@langchain/openai'

const qaModel = new OpenAI({ modelName: 'gpt-4', temperature: 0.3 })

export interface QAPair {
  question: string
  answer: string
  evalCriteria?: string[]
  category?: string
  difficulty?: string
}

export const generateQAPairs = async (chunk: string, summary: string, context = ''): Promise<QAPair[]> => {
  const prompt = `Given the following summary and document chunk, generate question-answer pairs.
Summary: ${summary}
Context: ${context}
Chunk: ${chunk}

Each QA pair should have:
- A clear question
- A grounded answer from the chunk
- (Optional) Evaluation criteria
- (Optional) Category and difficulty

Return in JSON format.`

  const result = await qaModel.invoke(prompt)
  let parsedResult
  try {
    parsedResult = JSON.parse(result)
    if (!Array.isArray(parsedResult)) {
      throw new Error('Parsed result is not an array')
    }
  } catch {
    return []
  }
  return parsedResult
}
