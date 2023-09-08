import { builder } from '../../builder'
import { graphql, useFragment } from '../../gql'
import { GetSummaryFeedbackFragment } from '../../gql/graphql'
import { strapiClient } from '../../strapi-graphql-client'

const SummaryFeedbackReference =
  builder.objectRef<GetSummaryFeedbackFragment>('SummaryFeedback')

const SummaryFeedbackInput = builder.inputType('SummaryFeedbackInput', {
  fields: (t) => ({
    webPageSummaryId: t.string(),
  }),
})

builder.objectType(SummaryFeedbackReference, {
  name: 'SummaryFeedback',
  fields: (t) => ({
    id: t.string({ resolve: (parent) => parent.id ?? '' }),
    webPageSummaryId: t.string({
      resolve: (parent) => parent.attributes?.web_page_summary?.data?.id ?? '',
    }),
  }),
})

builder.queryField('summaryFeedbacksById', (t) =>
  t.field({
    type: [SummaryFeedbackReference],
    args: {
      data: t.arg({ type: SummaryFeedbackInput, required: true }),
    },
    resolve: async (parent, arguments_) => {
      try {
        const result = await strapiClient.request(
          graphql(`
            query getSummaryFeedbacks($webPageSummaryId: ID!) {
              summaryFeedbacks(
                filters: { web_page_summary: { id: { eq: $webPageSummaryId } } }
              ) {
                data {
                  ...GetSummaryFeedback
                }
              }
            }
          `),
          {
            webPageSummaryId: arguments_.data.webPageSummaryId,
          },
        )

        const summaryFeedbackDatas = result.summaryFeedbacks?.data ?? []
        return summaryFeedbackDatas.map((data) => {
          return useFragment(
            graphql(`
              fragment GetSummaryFeedback on SummaryFeedbackEntity {
                id
                attributes {
                  web_page_summary {
                    data {
                      id
                    }
                  }
                }
              }
            `),
            data,
          )
        })
      } catch (error) {
        console.error('Error fetching data from Strapi:', error)

        return []
      }
    },
  }),
)
