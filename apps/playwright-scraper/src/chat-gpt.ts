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

    return response.data.choices.at(0)?.message?.content ?? ''
  } catch (error) {
    console.error('Error using chatGPT')
    console.log(JSON.stringify(error, undefined, 2))
    return ''
  }
}

export const getSummaryAndKeywords = async (
  originalContent: string,
  keywordPrompt: string | null | undefined,
  summaryPrompt: string | null | undefined,
) => {
  if (!keywordPrompt || !summaryPrompt) {
    console.log('no keywordPrompt or summaryPrompt found')
    // TODO: a webPageSummary should be created if there is no summaryPrompt
    //  or keywordPrompt,or if the creation of the summary or keywords fails?
    return {
      summary: '',
      keywords: [],
    }
  }

  const summary = await createChatCompletion(
    originalContent,
    JSON.parse(summaryPrompt),
  )

  const keywordsResponse = await createChatCompletion(
    originalContent,
    JSON.parse(keywordPrompt),
  )

  const keywords =
    /^\d+\./.test(keywordsResponse) || /^-\s/.test(keywordsResponse)
      ? keywordsResponse.split('\n')
      : keywordsResponse.split(',')

  return {
    summary,
    keywords: keywords
      .map((word) => word.replace(/^\d+\.\s*|^-?\s*|,$/, '').trim())
      .slice(0, 10),
  }
}
