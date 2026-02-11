import { builder } from '../builder'

builder.simpleObject('WorkspaceProcessStatistics', {
  description: 'Statistics about backend events',
  fields: (t) => ({
    requestType: t.field({
      type: 'ProcessingRequestType',
      nullable: false,
    }),
    totalMessages: t.int({ nullable: false }),
    processedMessages: t.int({ nullable: false }),
    pendingMessages: t.int({ nullable: false }),
  }),
})
