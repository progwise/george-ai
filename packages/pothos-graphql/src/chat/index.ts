import { builder } from '../builder'
import { ask } from '@george-ai/langchain-chat'

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
    },
    resolve: async (_root, { question, sessionId }) => {
      if (!sessionId) {
        sessionId = 'default'
      }
      const result = await ask({
        question,
        sessionId,
        retrievalFlow: 'Sequential',
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
