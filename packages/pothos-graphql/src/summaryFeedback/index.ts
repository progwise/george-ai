import { builder } from '../builder'
import {
  Enum_Summaryfeedback_Voting,
  SummaryFeedbackEntityResponse,
} from '../gql/graphql'
import { createSummaryFeedback } from '@george-ai/strapi-client'

const SummaryFeedbackVoting = builder.enumType(Enum_Summaryfeedback_Voting, {
  name: 'SummaryFeedbackVoting',
})

const SummaryFeedbackReference =
  builder.objectRef<SummaryFeedbackEntityResponse>('CreateSummaryFeedback')

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

builder.objectType(SummaryFeedbackReference, {
  name: 'CreateSummaryFeedback',
  fields: (t) => ({
    id: t.string({ resolve: (parent) => parent.id ?? '' }),
    position: t.int({
      resolve: (parent) => parent.attributes?.position ?? 0,
    }),
    query: t.string({
      resolve: (parent) => parent.attributes?.query ?? '',
    }),
    voting: t.field({
      type: SummaryFeedbackVoting,
      resolve: (parent) => parent.attributes?.voting,
      nullable: true,
    }),
    webPageSummaryId: t.string({
      resolve: (parent) => parent.attributes?.web_page_summary?.data?.id ?? '',
    }),
  }),
})

builder.mutationField('createSummaryFeedback', (t) =>
  t.field({
    type: SummaryFeedbackReference,
    args: {
      data: t.arg({ type: CreateSummaryFeedbackInput }),
    },
    resolve: async (parent, arguments_) => {
      try {
        console.log('Imported createSummaryFeedback:', createSummaryFeedback)

        const feedbackData = await createSummaryFeedback(
          arguments_.data.position,
          arguments_.data.query,
          arguments_.data.voting,
          arguments_.data.webPageSummaryId,
        )
        return feedbackData!
      } catch (error) {
        console.error('Error while creating Summary Feedback:', error)
        return {}
      }
    },
  }),
)
