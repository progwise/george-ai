import { OllamaProviderConnection } from '@george-ai/app-commons'

import { EmbeddingsResult } from '../common'
import { ollamaApiPost } from './ollama-rest-api'
import { OllamaEmbeddingResponseSchema } from './schema'

export async function generateOllamaEmbeddings(
  connection: OllamaProviderConnection,
  modelName: string,
  input: string | string[],
  abortSignal?: AbortSignal,
): Promise<EmbeddingsResult> {
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
    embeddings: result.embeddings.map((emb, index) => ({ inputText: inputTexts[index], embedding: emb })),
    usage: result.usage,
  }
}
