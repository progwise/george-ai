import { BaseMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'

import { SupportedModel, getModel } from './assistant-model'

const relevancePrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are a helpful assistant that has the provided name and access to the assistant's base information, conversation history, and the current user question.
    Your boss has asked you to determine whether the following statement is relevant to this assistant, considering the assistant's base information, the available library data, and the conversation history:
    Return 'yes' if the condition applies to the conversation and 'no' if it does not.
    Your answer must be either 'yes' or 'no', without any additional text or translation of the word.
    
    Hier sind Deine Basisinformation zu Dir selbst, d.h. Dein Name als Assistent, Deine Beschreibung und weitere Anweisungen
    {assistant_base_information}

    Ausserdem hast Du Zugriff auf die folgenden Bibliotheken:
    {library_base_information}
    
    Hier ist die Konversationshistorie
    {chat_history}
    
    Hier ist die aktuelle Frage des Benutzers
    {question}`,
  ],
  new MessagesPlaceholder('assistant_base_information'),
  new MessagesPlaceholder('chat_history'),
  ['human', '{question}'],
])

export const getRelevance = async ({
  assistantBaseInformation,
  libraryBaseInformation,
  question,
  chatHistory,
  modelName,
}: {
  assistantBaseInformation: BaseMessage[]
  libraryBaseInformation: BaseMessage[]
  question: string
  chatHistory: BaseMessage[]
  modelName: SupportedModel
}) => {
  const prompt = await relevancePrompt.invoke({
    question,
    assistant_base_information: assistantBaseInformation,
    chat_history: chatHistory,
    library_base_information: libraryBaseInformation,
  })

  const model = getModel(modelName)

  const isRelevantAnswer = await model.invoke(prompt, {})
  return isRelevantAnswer.content.toString().toLowerCase().trim() === 'yes'
}
