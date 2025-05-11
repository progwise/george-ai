import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { BaseMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'

export const getLibraryRelevancePrompt = async (
  model: BaseChatModel,
  {
    chatHistory,
    question,
    libraryDescription,
    libraryName,
    libraryUsedFor,
  }: {
    chatHistory: BaseMessage[]
    question: string
    libraryDescription: string
    libraryName: string
    libraryUsedFor: string
  },
) => {
  const prompt = await getLibraryPrompt({
    chatHistory,
    question,
    libraryDescription,
    libraryName,
    libraryUsedFor,
  })

  const libraryPromptResult = await model.invoke(prompt, {})
  const libraryPromptResultParsed = JSON.parse(libraryPromptResult.content.toString())
  return {
    isRelevant: libraryPromptResultParsed.isRelevant as boolean,
    searchPrompt: libraryPromptResultParsed.searchPrompt as string,
  }
}

const getLibraryPrompt = async ({
  chatHistory,
  question,
  libraryDescription,
  libraryName,
  libraryUsedFor,
}: {
  chatHistory: BaseMessage[]
  question: string
  libraryDescription: string
  libraryName: string
  libraryUsedFor: string
}) => {
  const prompt = await ChatPromptTemplate.fromMessages([
    [
      'system',
      `You need to determine whether the following library is relevant to the current user question combined with the latest chat history.
      Relevance is decided based on the library's name, description and usedFor information,
      as well as the conversation history and the current user question.

      You also need to provide search propmpt that can be used to search for relevant information in the library.
      This prompt should be a list of keywords that someone would use the query that information from google search console.
      Please exclude all keywords that are given in the library name, description and usedFor information.
      Please add keywords for the year or any specific information the user is searching for.
      Please order the keywords from the most relevant to the least relevant. E.g. the year is more relevant than the name of the ship.
      
      These are 2 fields for the following output structure.

      {json_format}


      You have to answer with this JSON structure only. No additional text, explanation or white space is allowed. Your answer will be parsed as JSON.
        `,
    ],
    ['system', 'Here is the library name:'],
    new MessagesPlaceholder('library_name'),
    ['system', 'Here is the library description:'],
    new MessagesPlaceholder('library_description'),
    ['system', 'Here is the the explanation of what the library should be used for:'],
    new MessagesPlaceholder('library_used_for'),
    ['system', 'This is the latest chat history:'],
    new MessagesPlaceholder('chat_history'),
    ['system', "This is the user's question:"],
    new MessagesPlaceholder('question'),
  ])
  return await prompt.invoke({
    library_name: libraryName,
    library_description: libraryDescription,
    library_used_for: libraryUsedFor,
    chat_history: chatHistory,
    question: question,
    json_format: JSON.stringify({
      isRelevant: true,
      searchPrompt: 'search prompt',
    }),
  })
}
