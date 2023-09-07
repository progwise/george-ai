import { builder } from '../../builder'
import { graphql, useFragment } from '../../gql'
import { SummaryFeedbackFragment } from '../../gql/graphql'
import { strapiClient } from '../../strapi-graphql-client'
import {
  SUMMARY_FEEDBACK_FRAGMENT,
  SummaryFeedbackVotingReference,
} from './summary-feedback-create-mutation-field'

export const DeletSummaryFeedbackReference =
  builder.objectRef<SummaryFeedbackFragment>('DeletSummaryFeedback')

const DeleteSummaryFeedbackInput = builder.inputType(
  'DeleteSummaryFeedbackInput',
  {
    fields: (t) => ({
      feedbackSummaryId: t.string(),
    }),
  },
)

builder.objectType(DeletSummaryFeedbackReference, {
  name: 'DeleteSummaryFeedback',
  fields: (t) => ({
    id: t.string({ resolve: (parent) => parent.id ?? '' }),
    feedbackDate: t.string({
      resolve: (parent) => parent.attributes?.feedbackDate ?? '',
    }),
    position: t.int({
      resolve: (parent) => parent.attributes?.position ?? 0,
    }),
    query: t.string({
      resolve: (parent) => parent.attributes?.query ?? '',
    }),
    voting: t.field({
      type: SummaryFeedbackVotingReference,
      resolve: (parent) => parent.attributes?.voting,
      nullable: true,
    }),
    webPageSummaryId: t.string({
      resolve: (parent) => parent.attributes?.web_page_summary?.data?.id ?? '',
    }),
  }),
})

builder.mutationField('deleteSummaryFeedbackMutation', (t) =>
  t.field({
    type: DeletSummaryFeedbackReference,
    args: {
      data: t.arg({ type: DeleteSummaryFeedbackInput, required: true }),
    },
    resolve: async (parent, arguments_) => {
      try {
        const result = await strapiClient.request(
          graphql(`
            mutation DeleteSummaryFeedback($id: ID!) {
              deleteSummaryFeedback(id: $id) {
                data {
                  ...SummaryFeedback
                }
              }
            }
          `),
          {
            id: arguments_.data.feedbackSummaryId,
          },
        )

        console.log(
          'delete SummaryFeedback',
          result.deleteSummaryFeedback?.data,
        )
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useFragment(
          SUMMARY_FEEDBACK_FRAGMENT,
          result.deleteSummaryFeedback?.data,
        )!
      } catch (error) {
        console.error(
          'An error occurred while deleting the Summary Feedback:',
          error,
        )
        return {}
      }
    },
  }),
)
