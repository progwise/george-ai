import { createProposalForSummary } from '@george-ai/strapi-client'
import { builder } from '../builder'

const CreateProposalSummaryInput = builder.inputType(
  'CreateProposalSummaryInput',
  {
    fields: (t) => ({
      proposalSummary: t.string(),
      summaryId: t.string(),
      locale: t.string(),
    }),
  },
)

const ProposalSummaryReference = builder.simpleObject(
  'ProposalSummaryReference',
  {
    fields: (t) => ({
      id: t.string(),
    }),
  },
)

builder.mutationField('createProposalSummary', (t) =>
  t.field({
    type: ProposalSummaryReference,
    args: {
      data: t.arg({ type: CreateProposalSummaryInput }),
    },
    resolve: async (parent, arguments_) => {
      return await createProposalForSummary(
        arguments_.data.proposalSummary,
        arguments_.data.summaryId,
        arguments_.data.locale,
      )
    },
  }),
)
