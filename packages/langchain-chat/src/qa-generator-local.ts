export interface QAPair {
  question: string
  answer: string
  evalCriteria?: string[]
  category?: string
  difficulty?: string
}

export const generateQAPairs = async (chunk: string, summary: string, context = ''): Promise<QAPair[]> => {
  const prompt = `You are a helpful assistant. Given the following summary and document chunk, generate question-answer pairs.

Summary: ${summary}
Context: ${context}
Chunk: ${chunk}

Each QA pair should have:
- A clear question
- A grounded answer from the chunk
- (Optional) Evaluation criteria
- (Optional) Category and difficulty

Make sure that your reply is cmpletely JSONL foramt.`

  try {
    const res = await fetch('http://host.docker.internal:4567/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mlx-community/gemma-3-27b-it-qat-6bit',
        // model: 'Qwen/Qwen2.5-Coder-0.5B-Instruct',
        prompt,
        maxTokens: 300,
      }),
    })

    if (!res.ok) {
      console.error(`API call failed with status: ${res.status} ${res.statusText}`)
      const errorText = await res.text()
      console.error('Error response:', errorText)
      return []
    }

    const data = await res.json()

    if (!data || !data.output) {
      console.error('No output from model API')
      return []
    }

    let parsedResult
    try {
      parsedResult = JSON.parse(data.output)
      if (!Array.isArray(parsedResult)) throw new Error('Parsed result is not an array')
    } catch (parseError) {
      console.error('Failed to parse model response as JSON:', data.output, parseError)
      return []
    }

    return parsedResult
  } catch (err) {
    console.error('Failed to generate QA pairs:', err)
    return []
  }
}
