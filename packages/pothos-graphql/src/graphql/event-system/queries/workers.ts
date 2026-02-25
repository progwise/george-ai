import { isAdminOrThrow } from '@george-ai/app-domain'
import { workerRegistry } from '@george-ai/event-service-client'

import { builder } from '../../builder'

builder.queryField('workers', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ['WorkerEntry'],
    nullable: false,
    resolve: async (_parent, _args, { session }) => {
      await isAdminOrThrow(session.user.id)
      const entries = await workerRegistry.getWorker()
      return entries
    },
  }),
)
