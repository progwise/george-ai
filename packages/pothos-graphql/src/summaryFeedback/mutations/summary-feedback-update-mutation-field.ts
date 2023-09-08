import { builder } from '../../builder'
import { graphql, useFragment } from '../../gql'
import {
  Enum_Summaryfeedback_Voting,
  SummaryFeedbackFragment,
} from '../../gql/graphql'
import { strapiClient } from '../../strapi-graphql-client'
import { formatISO } from 'date-fns'
import {
  SUMMARY_FEEDBACK_FRAGMENT,
  SummaryFeedbackVotingReference,
} from './summary-feedback-create-mutation-field'

export const UpdateSummaryFeedbackReference =
  builder.objectRef<SummaryFeedbackFragment>('UpdateSummaryFeedback')

const UpdateSummaryFeedbackInput = builder.inputType(
  'UpdateSummaryFeedbackInput',
  {
    fields: (t) => ({
      summaryFeedbackId: t.string(),
      position: t.int(),
      query: t.string(),
      voting: t.field({
        type: SummaryFeedbackVotingReference,
      }),
      webPageSummaryId: t.string(),
    }),
  },
)

builder.objectType(UpdateSummaryFeedbackReference, {
  name: 'UpdateSummaryFeedback',
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

builder.mutationField('updateSummaryFeedbackMutation', (t) =>
  t.field({
    type: UpdateSummaryFeedbackReference,
    args: {
      data: t.arg({ type: UpdateSummaryFeedbackInput }),
    },
    resolve: async (parent, arguments_) => {
      try {
        const input = {
          feedbackDate: formatISO(new Date(), { representation: 'date' }),
          position: arguments_.data.position,
          query: arguments_.data.query,
          voting: arguments_.data.voting,
          web_page_summary: arguments_.data.webPageSummaryId,
        }

        const result = await strapiClient.request(
          graphql(`
            mutation UpdateSummaryFeedback(
              $id: ID!
              $data: SummaryFeedbackInput!
            ) {
              updateSummaryFeedback(id: $id, data: $data) {
                data {
                  ...SummaryFeedback
                }
              }
            }
          `),
          {
            id: arguments_.data.summaryFeedbackId,
            data: input,
          },
        )

        console.log(
          'update SummaryFeedback',
          result.updateSummaryFeedback?.data,
        )
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useFragment(
          SUMMARY_FEEDBACK_FRAGMENT,
          result.updateSummaryFeedback?.data,
        )!
      } catch (error) {
        console.error(
          'An error occurred while updating the Summary Feedback:',
          error,
        )
        return {}
      }
    },
  }),
)
