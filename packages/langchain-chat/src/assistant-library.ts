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
      `You need to determine whether the following library is relevant to the current user question.
      Relevance is decided based on the library's name, description and usedFor information,
      as well as the conversation history and the current user question.
      You must provide a pure JSON response without any additional text.
      The result must be valid JSON that can be parsed without errors.
      Ensure there is no extra text, only properly formatted JSON in the following structure:
      
      {json_format}
      
      Your task is also produce a single concise but contextually rich search query that captures the key details of what the user is asking, considering all previous messages in the conversation.
        The result should be a short phrase or sentence that includes the latest request, suitable for a similarity search.
        Add the search prompt to the JSON as the value of the key "searchPrompt".
        
      Here is the base information for the library you have to create the search query for:

      name of the library: {library_name}
      common description of the library: {library_description}
      Library should be used for: {library_used_for}

        
        Here is the conversation history:
        
        {chat_history}
        
        Here is the current user question:
        
        {question}
        
        Please make the search term short and do not include any expression or term or word that was already used in the assistant description or in the library description.
        `,
    ],
    new MessagesPlaceholder('library_name'),
    new MessagesPlaceholder('library_description'),
    new MessagesPlaceholder('library_used_for'),
    new MessagesPlaceholder('chat_history'),
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
