import { OpenAI } from '@langchain/openai'

const qaModel = new OpenAI({ modelName: 'gpt-4', temperature: 0.3 })

export interface QAPair {
  prompt: string
  completion: string
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
- (Optional) Evaluation criteria (as a string array)
- (Optional) Category and difficulty

Output format: JSONL (one JSON object per line, no extra text).
Each object must use "prompt" for the question and "completion" for the answer.
Example:
{"prompt": "...", "completion": "...", "evalCriteria": ["..."], "category": "...", "difficulty": "..."}
{"prompt": "...", "completion": "...", ...}
`

  const result = await qaModel.invoke(prompt)
  const lines = result.split('\n').filter((line) => line.trim())
  const qaPairs = lines
    .map((line) => {
      const obj = JSON.parse(line)
      if (obj.prompt && obj.completion) {
        return obj as QAPair
      }
      return null
    })
    .filter((item): item is QAPair => item !== null)

  return qaPairs
}
