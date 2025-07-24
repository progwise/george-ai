import { getModel } from './assistant-model'

export interface QAPair {
  prompt: string
  completion: string
  evalCriteria?: string[]
  category?: string
  difficulty?: string
}

export const generateQAPairs = async (chunk: string, summary: string): Promise<QAPair[]> => {
  const qaModel = await getModel('llama3.1:latest')

  const prompt = `Given the following summary and document chunk, generate question-answer pairs.
Summary: ${summary}
Chunk: ${chunk}

Each QA pair should have:
- A clear question
- A grounded answer from the chunk
- (Optional) Evaluation criteria (as a string array)
- (Optional) Category and difficulty

Output format: JSONL (one JSON object per line, no extra text).
Each object must use "prompt" for the question and "completion" for the answer.
Example:
<start_of_turn>user
knock knock<end_of_turn>
<start_of_turn>model
who is there<end_of_turn>
<start_of_turn>user
Gemma<end_of_turn>
<start_of_turn>model
Gemma who?<end_of_turn>
`

  const result = await qaModel.invoke(prompt)
  const lines = result.content
    .toString()
    .split('\n')
    .filter((line: string) => line.trim())
  const qaPairs = lines
    .map((line: string) => {
      try {
        const obj = JSON.parse(line)
        if (obj.prompt && obj.completion) {
          console.log('QA Pair:', obj) // Log each QA pair
          return obj as QAPair
        }
        return null
      } catch {
        console.warn('Failed to parse line as JSON:', line)
        return null
      }
    })
    .filter((item: QAPair | null): item is QAPair => item !== null)

  qaPairs.forEach((qa, idx) => {
    // **** QA Pair Output ****
    console.info(`\x1b[45m\x1b[37m[QA ${idx + 1}]\x1b[0m`, '\x1b[35m' + JSON.stringify(qa, null, 2) + '\x1b[0m')
    // ********************************
  })
  return qaPairs
}
