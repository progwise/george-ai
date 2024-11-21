import { builder } from '../builder'
import { ask } from '@george-ai/langchain-chat'

const ChatAnswer = builder.simpleObject('ChatAnswer', {
  fields: (t) => ({
    answer: t.string(),
    sessionId: t.string(),
    source: t.string(),
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
    resolve: async (parent, { question, sessionId }, context, info) => {
      if (!sessionId) {
        sessionId = 'default'
      }
      const result = await ask({ question, sessionId })
      return { answer: result.answer, sessionId, source: result.source }
    },
  }),
)
