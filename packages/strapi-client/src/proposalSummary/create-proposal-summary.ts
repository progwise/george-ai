import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const createProposalForSummary = async (
  proposalSummary: string,
  summaryId: string,
) => {
  const { createProposalForSummary } = await strapiClient.request(
    graphql(`
      mutation CreateProposalForSummary(
        $proposalSummary: String!
        $summaryId: ID!
      ) {
        createProposalForSummary(
          data: {
            proposalSummary: $proposalSummary
            web_page_summary: $summaryId
          }
        ) {
          data {
            id
            attributes {
              proposalSummary
              web_page_summary {
                data {
                  id
                }
              }
            }
          }
        }
      }
    `),
    {
      proposalSummary,
      summaryId,
    },
  )
  console.log(
    'create ProposalSummary by id:',
    createProposalForSummary?.data?.id,
  )
  return { id: createProposalForSummary?.data?.id! }
}
