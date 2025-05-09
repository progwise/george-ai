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

  try {
    const response = await fetch('http://host.docker.internal:3000/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-Coder-7B-Instruct',
        prompt,
        adapterPath: 'adapters',
        maxTokens: 150,
      }),
    })

    if (!response.ok) {
      throw new Error(`API call failed with status ${response.status}: ${response.statusText}`)
    }

    const result = (await response.json()) as { output: string }
    const parsedResult = JSON.parse(result.output)

    if (!Array.isArray(parsedResult)) {
      throw new Error('Parsed result is not an array')
    }

    return parsedResult
  } catch (error) {
    console.error('Error generating QA pairs:', error)
    return []
  }
}
