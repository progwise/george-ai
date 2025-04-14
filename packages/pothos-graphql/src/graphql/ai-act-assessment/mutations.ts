import { getDefaultBasicSystemInfo } from '@george-ai/ai-act'

import { prisma } from '../../prisma'
import { builder } from '../builder'

builder.mutationField('resetAssessmentAnswers', (t) =>
  t.field({
    type: 'DateTime',
    args: {
      assistantId: t.arg.string({ required: true }),
    },
    resolve: async (_source, args) => {
      const { assistantId } = args
      await prisma.aiAssistantEUActAnswers.deleteMany({
        where: {
          assistantId,
        },
      })
      return new Date()
    },
  }),
)

builder.mutationField('updateAssessmentQuestion', (t) =>
  t.field({
    type: 'DateTime',
    args: {
      assistantId: t.arg.string({ required: true }),
      questionId: t.arg.string({ required: true }),
      value: t.arg.string({ required: false }),
      notes: t.arg.string({ required: false }),
    },
    resolve: async (_source, args) => {
      const { assistantId, questionId, value, notes } = args
      const basicSystemInfo = getDefaultBasicSystemInfo(assistantId)
      const question = basicSystemInfo.questions.find((q) => q.id === questionId)
      if (!question) {
        throw new Error('Question not found')
      }
      const answer = await prisma.aiAssistantEUActAnswers.upsert({
        where: {
          assistantId_questionId: {
            assistantId,
            questionId,
          },
        },
        create: {
          assistantId,
          questionId,
          answer: value ?? null,
          notes: notes ?? null,
        },
        update: {
          answer: value ?? null,
          notes: notes ?? null,
        },
      })
      return answer.updatedAt
    },
  }),
)
