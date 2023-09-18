import { builder } from '../builder'
import { graphql, useFragment } from '../gql'
import {
  Enum_Summaryfeedback_Voting,
  SummaryFeedbackFragment,
} from '../gql/graphql'
import { strapiClient } from '../strapi-graphql-client'

const summaryFeedbackFragment = graphql(`
  fragment SummaryFeedback on SummaryFeedbackEntity {
    id
    attributes {
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

const SummaryFeedbackVoting = builder.enumType(Enum_Summaryfeedback_Voting, {
  name: 'SummaryFeedbackVoting',
})

const SummaryFeedbackReference = builder.objectRef<SummaryFeedbackFragment>(
  'CreateSummaryFeedback',
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
            input: {
              position: arguments_.data.position,
              query: arguments_.data.query,
              voting: arguments_.data.voting,
              web_page_summary: arguments_.data.webPageSummaryId,
            },
          },
        )

        console.log(
          'create SummaryFeedback',
          result.createSummaryFeedback?.data,
        )
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useFragment(
          summaryFeedbackFragment,
          result.createSummaryFeedback?.data,
        )!
      } catch (error) {
        console.error('Error while creating Summary Feedback:', error)
        return {}
      }
    },
  }),
)
