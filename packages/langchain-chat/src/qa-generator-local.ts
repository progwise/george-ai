export interface QAPair {
  question: string
  answer: string
  evalCriteria?: string[]
  category?: string
  difficulty?: string
}

const LOCAL_API_URL = 'http://host.docker.internal:3000/generate'

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

  try {
    const response = await fetch(LOCAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-Coder-7B-Instruct',
        prompt,
        maxTokens: 500
      })
    })

    const data = await response.json()

    if (!data || typeof data !== 'object' || !data.output) {
      throw new Error('Invalid response from local API')
    }

    const parsedResult = JSON.parse(data.output)

    if (!Array.isArray(parsedResult)) {
      throw new Error('Parsed result is not an array')
    }

    return parsedResult as QAPair[]
  } catch (err) {
    console.error('QA generation error:', err)
    return []
  }
}
