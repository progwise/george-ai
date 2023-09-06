import { builder } from '../builder'
import { graphql, useFragment } from '../gql'
import { strapiClient } from '../strapi-graphql-client'
import {
  Enum_Summaryfeedback_Voting,
  SummaryFeedbackFragment,
} from '../gql/graphql'
import { formatISO } from 'date-fns'

// const SummaryFeedbackMutationFragment = graphql(`
//   fragment SummaryFeedback on SummaryFeedbackEntity {
//     id
//     attributes {
//       feedbackDate
//       position
//       query
//       voting
//       web_page_summary {
//         data {
//           id
//         }
//       }
//     }
//   }
// `)

// const CreateSummaryFeedbackMutation = graphql(`
//   mutation CreateSummaryFeedback($input: SummaryFeedbackInput!) {
//     createSummaryFeedback(data: $input) {
//       data {
//         ...SummaryFeedback
//       }
//     }
//   }
// `)

const SummaryFeedbackVotingReference = builder.enumType(
  Enum_Summaryfeedback_Voting,
  { name: 'SummaryFeedbackVoting' },
)

const SummaryFeedbackReference =
  builder.objectRef<SummaryFeedbackFragment>('SummaryFeedback')

const SummaryFeedbackInput = builder.inputType('SummaryFeedbackInput', {
  fields: (t) => ({
    position: t.int(),
    query: t.string(),
    voting: t.field({
      type: SummaryFeedbackVotingReference,
    }),
    webPageSummaryId: t.string(),
  }),
})

builder.objectType(SummaryFeedbackReference, {
  name: 'SummaryFeedback',
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

builder.mutationField('createSummaryFeedback', (t) =>
  t.field({
    type: SummaryFeedbackReference,
    args: {
      data: t.arg({ type: SummaryFeedbackInput, required: true }),
    },
    resolve: async (root, arguments_) => {
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

      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useFragment(
        graphql(`
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
        `),
        result.createSummaryFeedback?.data,
      )!
    },
  }),
)
