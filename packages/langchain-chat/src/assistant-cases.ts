import { BaseMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'

import { Assistant } from './assistant'
import { getModel } from './assistant-model'

const evaluateConditionPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You have been given a condition in the condition placeholder below to evaluate if it is true or false.
    Given the current user question and the conversation history, evaluate if the condition is true or false.
    Return 'true' if the condition is true and 'false' if it is false.
    Your answer can only be 'true' or 'false' without any additional text and without translation of the word.
    `,
  ],
  new MessagesPlaceholder('condition'),
  new MessagesPlaceholder('chat_history'),
  ['human', '{question}'],
])

const evaluateInstructionPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You have been given an instruction to execute.
      Add a short summary of the condition that lead to this instruction in the language of the humans question.
      You are allowed to ask a direct question to the user. Do not add any additional text. Just the question with a question mark at the end.
      Use the language of the humans question for the answer. Be careful not to answer in english. You need to find out the right language from the humans question first.`,
  ],
  new MessagesPlaceholder('instruction'),
  new MessagesPlaceholder('condition'),
  new MessagesPlaceholder('chat_history'),
  ['human', '{question}'],
])

export const getConditionIsTrue = async (input: {
  assistant: Assistant
  baseCase: { condition?: string | null; instruction?: string | null }
  message: string
  history: BaseMessage[]
}) => {
  const instructionPrompt = await evaluateInstructionPrompt.invoke({
    instruction: input.baseCase.instruction || [],
    condition: input.baseCase.condition || [],
    chat_history: input.history || [],
    question: input.message,
  })

  console.log('instructionPrompt', instructionPrompt)

  if (!input.baseCase.condition) return { caseApplies: true, instructionPrompt }

  const conditionPrompt = await evaluateConditionPrompt.invoke({
    condition: input.baseCase.condition,
    chat_history: input.history,
    question: input.message,
  })

  const model = getModel(input.assistant.languageModel)

  const isTrueAnswer = await model.invoke(conditionPrompt, {})

  console.log(input.baseCase.condition, isTrueAnswer.content.toString().toLowerCase().trim())

  return {
    caseApplies: isTrueAnswer.content.toString().toLowerCase().trim() === 'true',
    instructionPrompt,
  }
}
