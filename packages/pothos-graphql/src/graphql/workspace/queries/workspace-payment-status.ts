import { getWorkspacePaymentStatus } from '@george-ai/app-domain'

import { builder } from '../../builder'

const WorkspacePaymentStatus = builder.simpleObject('WorkspacePaymentStatus', {
  fields: (t) => ({
    isPaid: t.boolean({ nullable: false }),
    subscriptionType: t.string({ nullable: true }),
    validUntil: t.field({
      type: 'DateTime',
      nullable: true,
    }),
  }),
})

builder.queryField('workspacePaymentStatus', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: WorkspacePaymentStatus,
    args: {
      workspaceId: t.arg.id({ required: true }),
    },
    resolve: async (_root, { workspaceId }) => {
      return getWorkspacePaymentStatus(workspaceId)
    },
  }),
)
