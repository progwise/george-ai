import { EmbeddingResult, OpenAIHostConnection } from '@george-ai/app-schema'

import { openAIApiPost } from './openai-rest-api'
import { OpenAIEmbeddingResponseSchema } from './schema'

export async function generateOpenAIEmbeddings(
  connection: OpenAIHostConnection,
  modelName: string,
  input: string | string[],
  abortSignal?: AbortSignal,
): Promise<EmbeddingResult> {
  const data = await openAIApiPost(
    connection,
    '/embeddings',
    { model: modelName, input },
    OpenAIEmbeddingResponseSchema,
    abortSignal,
  )

  const inputTexts = Array.isArray(input) ? input : [input]

  return {
    embeddings: data.data.map((item, index) => ({
      vector: item.embedding,
      chunk: inputTexts[index],
    })),
    chunkTokens: data.usage.prompt_tokens,
    totalTokens: data.usage.total_tokens,
  }
}
