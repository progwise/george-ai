import { BaseMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'

const apologyPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are a helpful assistant that has access to the entire conversation history and the current user question. 
    You just found out that the current user question is not relevant to the condition.
    Your boss has asked you to apologize to the user for not being able to help with the current question.
    You can use the conversation history to find out what the user was asking about before.
    Your task is to apologize to the user for not being able to help with the current question.
    You need to find out the right language from the humans question first. Please answer only in this language.
    Please give 2 examples of question you could answer with the information you have.
    Please format your answer in markdown.
    Here is your identity. This is information about you and your rules:
    
    {assistant_base_information}
    
    Here is the conversation history:
    {chat_history}
    
    Here is the current user question:
    {question}`,
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
}) => {
  return await apologyPrompt.invoke({
    assistant_base_information: assistantBaseInformation,
    question: question,
    chat_history: chatHistory,
  })
}
