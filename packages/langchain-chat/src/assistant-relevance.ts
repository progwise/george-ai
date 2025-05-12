import { BaseMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'

import { SupportedModel, getModel } from './assistant-model'

const relevancePrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are a helpful assistant that has the provided name and access to the assistant's base information, conversation history, and the current user question.
    You are asked to decide whether the current user's question is relevant to the assistant's base information, the conversation history and the assistants libraries.
    Return 'yes' if the condition applies to the conversation and 'no' if it does not.
    Your answer must be either 'yes' or 'no', without any additional text or translation of the word.`,
  ],
  ['system', 'This is your identity. This is information about you and your rules:'],
  new MessagesPlaceholder('assistant_base_information'),
  ['system', 'This is the conversation history so far:'],
  new MessagesPlaceholder('chat_history'),
  ['system', 'This is the current user question:'],
  ['human', '{question}'],
])

export const getRelevance = async ({
  assistantBaseInformation,
  question,
  chatHistory,
  modelName,
}: {
  assistantBaseInformation: BaseMessage[]
  question: string
  chatHistory: BaseMessage[]
  modelName: SupportedModel
}) => {
  const prompt = await relevancePrompt.invoke({
    question,
    assistant_base_information: assistantBaseInformation,
    chat_history: chatHistory,
  })

  const model = getModel(modelName)

  const isRelevantAnswer = await model.invoke(prompt, {})
  return isRelevantAnswer.content.toString().toLowerCase().trim() === 'yes'
}
