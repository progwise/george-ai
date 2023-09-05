import { builder } from '../builder'
import { graphql, useFragment } from '../gql'
import { strapiClient } from '../strapi-graphql-client'
import {
  Enum_Summaryfeedback_Voting,
  SummaryFeedbackEntityResponse,
  SummaryFeedbackEntity,
} from '../gql/graphql'

const SummaryFeedbackMutationFragment = graphql(`
  fragment SummaryFeedbackMutationFragment on SummaryFeedbackEntityResponse {
    data {
      id
      attributes {
        query
        voting
        web_page_summary {
          data {
            id
          }
        }
      }
    }
  }
`)

const CreateSummaryFeedbackMutation = graphql(`
  mutation CreateSummaryFeedback($input: SummaryFeedbackInput!) {
    createSummaryFeedback(data: $input) {
      ...SummaryFeedbackMutationFragment
    }
  }
`)

const SummaryFeedbackVotingReference = builder.enumType(
  Enum_Summaryfeedback_Voting,
  { name: 'SummaryFeedbackVoting' },
)

const SummaryFeedbackReference =
  builder.objectRef<SummaryFeedbackEntity>('SummaryFeedback')

const SummaryFeedbackInput = builder.inputType('SummaryFeedbackInput', {
  fields: (t) => ({
    query: t.string(),
    voting: t.field({
      type: SummaryFeedbackVotingReference,
    }),
    webPageSummaryId: t.string(),
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
        query: 'uni',
        voting: Enum_Summaryfeedback_Voting.Up,
        web_page_summary: '7',
      }

      //const input = {
      //   query: arguments_.data.query,
      //   voting: arguments_.data.voting,
      //   web_page_summary: arguments_.data.webPageSummaryId,
      // }
      const result = await strapiClient.request(CreateSummaryFeedbackMutation, {
        input,
      })

      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useFragment(
        SummaryFeedbackMutationFragment,
        result.createSummaryFeedback,
      )
    },
  }),
)
