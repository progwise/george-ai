import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const createProposalForSummary = async (
  proposalSummary: string,
  summaryId: string,
  locale: string,
) => {
  const { createProposalForSummary } = await strapiClient.request(
    graphql(`
      mutation CreateProposalForSummary(
        $proposalSummary: String!
        $summaryId: ID!
        $locale: I18NLocaleCode!
      ) {
        createProposalForSummary(
          data: {
            proposalSummary: $proposalSummary
            web_page_summary: $summaryId
          }
          locale: $locale
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
      locale,
    },
  )
  console.log(
    'create ProposalSummary by id:',
    createProposalForSummary?.data?.id,
  )
  return { id: createProposalForSummary?.data?.id! }
}
