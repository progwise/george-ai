import { BaseMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'

const apologyPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are a helpful assistant with access to the entire conversation history and the current user question.
    You have determined that the current user question is not relevant.

    Please apologize to the user for not being able to answer their question.
    Please add 2 examples of questions you could answer with the information you have.
    You must answer in the language of the user's question.
    Please format your answer in markdown.

    Be sure to use the language of the user's question in your answer.
    Do not use any other language.
    Keep your answer short and concise.
    `,
  ],
  new MessagesPlaceholder('assistant_base_information'),
  new MessagesPlaceholder('chat_history'),
  ['human', '{question}'],
])

export const getApologyPrompt = async ({
  assistantBaseInformation,
  question,
  chatHistory,
}: {
  assistantBaseInformation: BaseMessage[]
  question: string
  chatHistory: BaseMessage[]
}): Promise<string> => {
  // Use format() instead of invoke() to get a string directly
  // format() returns Promise<string> - the formatted prompt as a string
  // invoke() returns Promise<ChatPromptValue> - array of messages
  // See: https://v03.api.js.langchain.com/classes/_langchain_core.prompts.ChatPromptTemplate.html#format
  return await apologyPrompt.format({
    assistant_base_information: assistantBaseInformation,
    question: question,
    chat_history: chatHistory,
  })
}
