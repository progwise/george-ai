import { workspace } from '@george-ai/app-domain'

import { builder } from '../builder'

builder.mutationField('startProcessing', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    args: {
      processingType: t.arg({ type: 'WorkspaceProcessingType', required: true }),
    },
    nullable: false,
    resolve: async (_root, args, context) => {
      const workspaceId = context.workspaceId
      await workspace.startProcessing(workspaceId, args.processingType)
      return true
    },
  }),
)
