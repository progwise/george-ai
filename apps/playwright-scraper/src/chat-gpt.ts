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

export const getServiceSummary = async (
  content: string,
  summaryPrompt: string[],
) => {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        ...summaryPrompt.map((prompt) => ({
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: prompt,
        })),
        { role: ChatCompletionRequestMessageRoleEnum.User, content },
      ],
    })

    const responseAsString = response.data.choices.at(0)?.message?.content
    return responseAsString
  } catch (error) {
    console.error('Error using chatGPT while fetching summary')
    console.log(JSON.stringify(error, undefined, 2))
  }
}

export const getKeywords = async (content: string, keywordPrompt: string[]) => {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        ...keywordPrompt.map((prompt) => ({
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: prompt,
        })),
        { role: ChatCompletionRequestMessageRoleEnum.User, content },
      ],
    })

    const responseAsString = response.data.choices.at(0)?.message?.content
    const keywords = responseAsString
      ?.split(',')
      .map((word) => word.replace(/Keywords: \n1\. |^\d+\. |\.$/, '').trim())
      .slice(0, 10)

    return keywords
  } catch (error) {
    console.error('Error using chatGPT while fetching keywords')
    console.log(JSON.stringify(error, undefined, 2))
  }
}
