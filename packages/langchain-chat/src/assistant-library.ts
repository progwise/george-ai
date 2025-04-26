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
      `You need to determine whether the following library is relevant to the current user question. Relevance is decided based onthe library's base information, the conversation history and the current user question.
      You must provide a pure JSON response without any additional text.
      The result must be valid JSON that can be parsed without errors.
      Ensure there is no extra text, only properly formatted JSON in the following structure:
      
      {json_format}
      
      Your task is also produce a single concise but contextually rich search query that captures the key details of what the user is asking, considering all previous messages in the conversation.
        The result should be a short phrase or sentence that includes the latest request, suitable for a similarity search.
        Add the search prompt to the JSON as the value of the key "searchPrompt".
        
      Here is the base information for the library you have to create the search query for:

      {library_base_information}


        Here is your identity, base information about you as an assistant, which rules to follow and to what information you have access to. Please do not consider other libraries than the one given above to create the search query:
        
        {assistant_base_information}
        
        Here is the conversation history:
        
        {chat_history}
        
        Here is the current user question:
        
        {question}
        
        Please make the search term short and do not include any expression or term or word that was already used in the assistant description or in the library description.
        `,
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
