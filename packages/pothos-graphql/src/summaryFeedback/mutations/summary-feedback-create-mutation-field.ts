import { EnumRef, ValuesFromEnum } from '@pothos/core'
import { builder } from '../../builder'
import { graphql, useFragment } from '../../gql'
import {
  Enum_Summaryfeedback_Voting,
  SummaryFeedbackFragment,
} from '../../gql/graphql'
import { strapiClient } from '../../strapi-graphql-client'
import { formatISO } from 'date-fns'

export const SUMMARY_FEEDBACK_FRAGMENT = graphql(`
  fragment SummaryFeedback on SummaryFeedbackEntity {
    id
    attributes {
      feedbackDate
      position
      query
      voting
      web_page_summary {
        data {
          id
        }
      }
    }
  }
`)

export const SummaryFeedbackVotingReference: EnumRef<
  ValuesFromEnum<typeof Enum_Summaryfeedback_Voting>
> = builder.enumType(Enum_Summaryfeedback_Voting, {
  name: 'SummaryFeedbackVoting',
})

const CreateSummaryFeedbackReference =
  builder.objectRef<SummaryFeedbackFragment>('CreateSummaryFeedback')

const CreateSummaryFeedbackInput = builder.inputType(
  'CreateSummaryFeedbackInput',
  {
    fields: (t) => ({
      position: t.int(),
      query: t.string(),
      voting: t.field({
        type: SummaryFeedbackVotingReference,
      }),
      webPageSummaryId: t.string(),
    }),
  },
)

builder.objectType(CreateSummaryFeedbackReference, {
  name: 'createSummaryFeedback',
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

builder.mutationField('createSummaryFeedbackMutation', (t) =>
  t.field({
    type: CreateSummaryFeedbackReference,
    args: {
      data: t.arg({ type: CreateSummaryFeedbackInput, required: true }),
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
            mutation CreateSummaryFeedback($input: SummaryFeedbackInput!) {
              createSummaryFeedback(data: $input) {
                data {
                  ...SummaryFeedback
                }
              }
            }
          `),
          {
            input,
          },
        )

        console.log(
          'create SummaryFeedback',
          result.createSummaryFeedback?.data,
        )
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useFragment(
          SUMMARY_FEEDBACK_FRAGMENT,
          result.createSummaryFeedback?.data,
        )!
      } catch (error) {
        console.error(
          'An error occurred while creating the Summary Feedback:',
          error,
        )
        return {}
      }
    },
  }),
)
