import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_API_ORG,
})
const openai = new OpenAIApi(configuration)

const createChatCompletion = async (content: string, prompts: string[]) => {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        ...prompts.map((prompt) => ({
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: prompt,
        })),
        { role: ChatCompletionRequestMessageRoleEnum.User, content },
      ],
    })

    return response.data.choices.at(0)?.message?.content
  } catch (error) {
    console.error('Error using chatGPT')
    console.log(JSON.stringify(error, undefined, 2))
  }
}

export const getSummaryAndKeywords = async (
  originalContent: string,
  promptForSummary: string | null | undefined,
  promptForKeywords: string | null | undefined,
) => {
  if (!promptForSummary || !promptForKeywords) {
    console.log('no keywordPrompt or summaryPrompt found')
    return
  }

  const summary = await createChatCompletion(
    originalContent,
    JSON.parse(promptForSummary),
  )

  const keywordsResponse = await createChatCompletion(
    originalContent,
    JSON.parse(promptForKeywords),
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
