import { ask } from '@george-ai/langchain-chat'
import { RetrievalFlow } from '@george-ai/langchain-chat'
import { builder } from '../builder'

console.log('Setting up: Chat')

const RetrievalFlowEnum = builder.enumType('RetrievalFlow', {
  values: ['Sequential', 'Parallel', 'OnlyLocal', 'OnlyWeb'] as const,
})
const ChatAnswer = builder.simpleObject('ChatAnswer', {
  fields: (t) => ({
    answer: t.string({ nullable: true }),
    sessionId: t.string({ nullable: true }),
    source: t.string({ nullable: true }),
    notEnoughInformation: t.boolean({ nullable: true }),
  }),
})

builder.mutationField('chat', (t) =>
  t.field({
    type: ChatAnswer,
    args: {
      question: t.arg.string({
        required: true,
      }),
      sessionId: t.arg.string({
        required: false,
      }),
      retrievalFlow: t.arg({
        type: RetrievalFlowEnum,
        required: false,
      }),
    },
    resolve: async (_root, { question, sessionId, retrievalFlow }) => {
      if (!sessionId) {
        sessionId = 'default'
      }
      const selectedFlow = (retrievalFlow ?? 'Sequential') as RetrievalFlow
      const result = await ask({
        question,
        sessionId,
        retrievalFlow: selectedFlow,
      })
      return {
        answer: result.answer,
        sessionId,
        source: result.source,
        notEnoughInformation: result.notEnoughInformation,
      }
    },
  }),
)
