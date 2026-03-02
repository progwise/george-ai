import { OpenAiProviderConnection } from '@george-ai/app-commons'

import { EmbeddingsResult } from '../common'
import { openAIApiPost } from './openai-rest-api'
import { OpenAIEmbeddingResponseSchema } from './schema'

export async function generateOpenAIEmbeddings(
  connection: OpenAiProviderConnection,
  modelName: string,
  input: string | string[],
  abortSignal?: AbortSignal,
): Promise<EmbeddingsResult> {
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
      embedding: item.embedding,
      inputText: inputTexts[index],
    })),
    usage: {
      promptTokens: data.usage.prompt_tokens,
      totalTokens: data.usage.total_tokens,
    },
  }
}
