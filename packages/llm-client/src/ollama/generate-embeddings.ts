import { EmbeddingResult, OllamaHostConnection } from '@george-ai/app-schema'

import { ollamaApiPost } from './ollama-rest-api'
import { OllamaEmbeddingResponseSchema } from './schema'

export async function generateOllamaEmbeddings(
  connection: OllamaHostConnection,
  modelName: string,
  input: string | string[],
  abortSignal?: AbortSignal,
): Promise<EmbeddingResult> {
  const data = await ollamaApiPost(
    connection,
    '/api/embed',
    { model: modelName, input },
    OllamaEmbeddingResponseSchema,
    abortSignal,
  )
  const result = {
    usage: { promptTokens: data.prompt_eval_count, totalTokens: data.prompt_eval_count },
    embeddings: data.embeddings,
  }

  const inputTexts = Array.isArray(input) ? input : [input]
  return {
    embeddings: result.embeddings.map((emb, index) => ({ chunk: inputTexts[index], vector: emb })),
    chunkTokens: result.usage.promptTokens,
    totalTokens: result.usage.totalTokens,
  }
}
