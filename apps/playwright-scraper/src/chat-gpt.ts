import dotenv from 'dotenv'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources'

dotenv.config()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const createChatCompletion = async (content: string, prompts: string[]) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        ...(prompts.map((prompt) => ({
          role: 'system',
          content: prompt,
        })) as ChatCompletionMessageParam[]),
        {
          role: 'user',
          content: content,
        },
      ],
    })

    return response.choices.at(0)?.message?.content
  } catch (error) {
    console.error('Error using chatGPT')
    console.log(JSON.stringify(error, undefined, 2))
  }
}

export const getSummaryAndKeywords = async (
  originalContent: string,
  keywordPrompt: string | null | undefined,
  summaryPrompt: string | null | undefined,
) => {
  if (!keywordPrompt || !summaryPrompt) {
    console.log('no keywordPrompt or summaryPrompt found')
    return
  }

  const summary = await createChatCompletion(
    originalContent,
    JSON.parse(summaryPrompt),
  )

  const keywordsResponse = await createChatCompletion(
    originalContent,
    JSON.parse(keywordPrompt),
  )

  if (!summary || !keywordsResponse) {
    return
  }

  const keywords =
    /^\d+\./.test(keywordsResponse) ||
    /^-\s/.test(keywordsResponse) ||
    /^Keywords:\s/.test(keywordsResponse)
      ? keywordsResponse.split('\n')
      : keywordsResponse.split(',')

  return {
    summary,
    keywords: keywords
      .map((word) => word.replace(/^\d+\.\s*|^-?\s*|,|Keywords:\s*/, '').trim())
      .slice(0, 10),
  }
}
