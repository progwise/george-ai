import { canAdminWorkspaceOrThrow } from '@george-ai/app-domain'
import { getWorkerSlots } from '@george-ai/event-service-client'

import { builder } from '../../builder'

builder.queryField('workers', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ['WorkerSlotEntry'],
    nullable: false,
    resolve: async (_parent, _args, { workspaceId, session }) => {
      await canAdminWorkspaceOrThrow(workspaceId, session.user.id)
      const entries = await getWorkerSlots({})
      return entries
    },
  }),
)
