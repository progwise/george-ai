import { builder } from '../builder'
import { createFeedback } from '@george-ai/strapi-client'

// eslint-disable-next-line @typescript-eslint/naming-convention
enum Enum_Summaryfeedback_Voting {
  Down = 'down',
  Up = 'up',
}

const SummaryFeedbackVoting = builder.enumType(Enum_Summaryfeedback_Voting, {
  name: 'SummaryFeedbackVoting',
})

const SummaryFeedbackReference = builder.simpleObject(
  'SummaryFeedbackReference',
  {
    fields: (t) => ({
      repuest: t.boolean(),
    }),
  },
)

const CreateSummaryFeedbackInput = builder.inputType(
  'CreateSummaryFeedbackInput',
  {
    fields: (t) => ({
      position: t.int(),
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
      await createFeedback(
        arguments_.data.position,
        arguments_.data.query,
        arguments_.data.voting,
        arguments_.data.webPageSummaryId,
      )
      return { repuest: true }
    },
  }),
)
