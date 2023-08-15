import { Configuration, OpenAIApi } from 'openai'
import dotenv from 'dotenv'

dotenv.config()
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_API_ORG,
})
const openai = new OpenAIApi(configuration)

export const getServiceSummary = async (content: string, language: string) => {
  try {
    let instruction = ''
    if (language === 'de') {
      instruction =
        'Gib mir eine Zusammenfassung der Angebote in maximal 300 Worten für folgenden Textinhalt einer Website mit Nennung von Ansprechpartnern und Kontaktinformationenen, in Deutsch.'
    } else if (language === 'en') {
      instruction =
        'Provide a summary of the offerings in a maximum of 300 words for the following website content, mentioning the contact persons and contact information, in english.'
    }

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: instruction,
        },
        {
          role: 'system',
          content: 'Format the answer.',
        },
        { role: 'user', content },
      ],
    })

    const responseAsString = response.data.choices.at(0)?.message?.content

    return responseAsString
  } catch (error) {
    console.error('error using chatGPT')
    console.log(JSON.stringify(error, undefined, 2))
  }
}

export const getKeywords = async (content: string, language: string) => {
  try {
    let instruction = ''
    if (language === 'de') {
      instruction =
        'Erzeuge eine List, die die wichtigsten META Keywords für SEO für den Text, die der User sendet, enthält, in Deutsch.'
    } else if (language === 'en') {
      instruction =
        'Generate a list containing the most important META keywords for SEO from the text the user provides, in english.'
    }

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: instruction,
        },
        {
          role: 'system',
          content: 'The list should contain 10 entries, sorted by importance.',
        },
        {
          role: 'system',
          content:
            "The list should be in the format: 'Keyword1, Keyword2, Keyword3, ..., Keyword10'.",
        },
        {
          role: 'system',
          content: 'Reply only with the 10 keywords, without any prefix.',
        },
        { role: 'user', content },
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
