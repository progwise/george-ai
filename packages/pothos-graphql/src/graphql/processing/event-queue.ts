import { EVENT_QUEUE_ACTIONS } from '@george-ai/app-schema'

import { builder } from '../builder'

builder.enumType('EventQueueAction', {
  values: EVENT_QUEUE_ACTIONS,
})

builder.simpleObject('EventQueue', {
  fields: (t) => ({
    action: t.field({ type: 'EventQueueAction', nullable: false }),
    status: t.field({ type: 'EventQueueStatus', nullable: false }),
    error: t.string({ nullable: true }),
    pending: t.int({ nullable: true }),
    delivered: t.int({ nullable: true }),
    redelivered: t.int({ nullable: true }),
    waiting: t.int({ nullable: true }),
  }),
})
