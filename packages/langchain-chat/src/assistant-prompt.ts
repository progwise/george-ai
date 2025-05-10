import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { BaseMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'

export const getSanitizedQuestion = async (
  model: BaseChatModel,
  data: { assistantBaseInformation: BaseMessage[]; chatHistory: BaseMessage[]; question: string },
) => {
  const { assistantBaseInformation, chatHistory, question } = data
  // Sanitize the question to gain control over the max tokens used
  const sanitizeQuestionPrompt = await getSanitizeQuestionPrompt().invoke({
    assistant_base_information: assistantBaseInformation,
    model,
    chat_history: chatHistory,
    question: question,
  })
  return await model.invoke(sanitizeQuestionPrompt, {})
}

const getSanitizeQuestionPrompt = () =>
  ChatPromptTemplate.fromMessages([
    [
      'system',
      `You need to sanitize the question provided.
      Do not answer the question, just re-write the question in a way that it is relevant to the assistant_base_information and the chat_history.
      Your answer should be maximum 500 tokens.
      You are not allowed to answer the question, just re-write it.
      Do not include any information that you re-writed the question. Just answer with the re-written question.

      You have to answer in the language of the users question. Do not use any other language.`,
    ],
    new MessagesPlaceholder('assistant_base_information'),
    new MessagesPlaceholder('chat_history'),
    ['human', '{question}'],
  ])
