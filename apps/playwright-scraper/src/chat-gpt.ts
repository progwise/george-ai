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

const prompts = {
  de: {
    summary: [
      'Gib mir eine Zusammenfassung der Angebote in maximal 300 Worten für folgenden Textinhalt einer Website mit Nennung von Ansprechpartnern und Kontaktinformationenen, in Deutsch.',
      'Formatiere die Antwort.',
    ],
    keywords: [
      'Erzeuge eine Liste, die die wichtigsten META Keywords für SEO für den Text, die der User sendet, enthält, in Deutsch.',
      'Die Liste sollte 10 Einträge enthalten, sortiert nach Wichtigkeit.',
      'Die Liste sollte im Format sein: "Keyword1, Keyword2, Keyword3, ..., Keyword10".',
      'Antworte nur mit den 10 Keywords, ohne jeglichen Präfix.',
    ],
  },
  en: {
    summary: [
      'Provide a summary of the offerings in a maximum of 300 words for the following website content, mentioning the contact persons and contact information, in english.',
      'Format the answer.',
    ],
    keywords: [
      'Generate a list containing the most important META keywords for SEO from the text the user provides, in english.',
      'The list should contain 10 entries, sorted by importance.',
      'The list should be in the format: "Keyword1, Keyword2, Keyword3, ..., Keyword10".',
      'Reply only with the 10 keywords, without any prefix.',
    ],
  },
}

export enum Language {
  DE = 'de',
  EN = 'en',
}

export const getServiceSummary = async (
  content: string,
  language: Language,
) => {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        ...prompts[language].summary.map((prompt) => ({
          role: 'system' as ChatCompletionRequestMessageRoleEnum,
          content: prompt,
        })),
        { role: 'user' as ChatCompletionRequestMessageRoleEnum, content },
      ],
    })

    const responseAsString = response.data.choices.at(0)?.message?.content
    return responseAsString
  } catch (error) {
    console.error('Error using chatGPT while fetching summary')
    console.log(JSON.stringify(error, undefined, 2))
  }
}

export const getKeywords = async (content: string, language: Language) => {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        ...prompts[language].keywords.map((prompt) => ({
          role: 'system' as ChatCompletionRequestMessageRoleEnum,
          content: prompt,
        })),
        { role: 'user' as ChatCompletionRequestMessageRoleEnum, content },
      ],
    })

    const responseAsString = response.data.choices.at(0)?.message?.content
    const keywords = responseAsString
      ?.split(',')
      .map((keyword) => keyword.trim())

    return keywords
  } catch (error) {
    console.error('Error using chatGPT while fetching keywords')
    console.log(JSON.stringify(error, undefined, 2))
  }
}
