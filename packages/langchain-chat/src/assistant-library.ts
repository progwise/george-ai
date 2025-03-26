import { BaseMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'

export const getLibraryPrompt = async ({
  assistantBaseInformation,
  libraryBaseInformation,
  chatHistory,
  question,
}: {
  assistantBaseInformation: BaseMessage[]
  libraryBaseInformation: BaseMessage[]
  chatHistory: BaseMessage[]
  question: string
}) => {
  const prompt = await ChatPromptTemplate.fromMessages([
    [
      'system',
      `You need to decide if the following library is relevant to the current user question. Relevance is defined by the library base information and the conversation history and the current user question.
      You need to provide a JSON without any additional text. Your result must be parsed by some JSON parser that should not fail. So avoid any additional text, just pure JSON in the format:
      
      {json_format}
      
      Your task is also produce a single concise but contextually rich search query that captures the key details of what the user is asking, considering all previous messages in the conversation.
        The result should be a short phrase or sentence that includes relevant historical context and the latest request, suitable for a similarity and web search.
        Add the search prompt to the JSON as the value of the key "searchPrompt".
        
      Here is the base information for the library you have to create the search query for:

      {library_base_information}


        Here is your identity, base information about you as an assistant, which rules to follow and to what information you have access to. Please do not consider other libraries than the one given above to create the search query:
        
        {assistant_base_information}
        
        Here is the conversation history:
        
        {chat_history}
        
        Here is the current user question:
        
        {question}`,
    ],
    new MessagesPlaceholder('library_base_information'),
    new MessagesPlaceholder('assistant_base_information'),
    new MessagesPlaceholder('chat_history'),
    new MessagesPlaceholder('question'),
  ])
  return await prompt.invoke({
    assistant_base_information: assistantBaseInformation,
    library_base_information: libraryBaseInformation,
    chat_history: chatHistory,
    question: question,
    json_format: JSON.stringify({
      isRelevant: true,
      searchPrompt: 'search prompt',
      libraryName: 'library name',
      libraryDescription: 'library description',
    }),
  })
}
