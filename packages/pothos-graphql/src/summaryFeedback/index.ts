import { builder } from '../builder'
import { createFeedback } from '@george-ai/strapi-client'

const SummaryFeedbackVoting = builder.enumType('SummaryFeedbackVoting', {
  values: ['down', 'up'] as const,
})

const SummaryFeedbackReference = builder.simpleObject(
  'SummaryFeedbackReference',
  {
    fields: (t) => ({
      id: t.string(),
    }),
  },
)

const CreateSummaryFeedbackInput = builder.inputType(
  'CreateSummaryFeedbackInput',
  {
    fields: (t) => ({
      selectedSummaryIndex: t.int(),
      query: t.string(),
      voting: t.field({
        type: SummaryFeedbackVoting,
      }),
      webPageSummaryId: t.string(),
    }),
  },
)

builder.mutationField('createSummaryFeedback', (t) =>
  t.field({
    type: SummaryFeedbackReference,
    args: {
      data: t.arg({ type: CreateSummaryFeedbackInput }),
    },
    resolve: async (parent, arguments_) => {
      const feedbackId = await createFeedback(
        arguments_.data.selectedSummaryIndex,
        arguments_.data.query,
        arguments_.data.voting,
        arguments_.data.webPageSummaryId,
      )
      return { id: feedbackId }
    },
  }),
)
