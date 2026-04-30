import { builder } from '../../builder'

export const triggerResult = builder.simpleObject('TriggerAutomationResult', {
  fields: (t) => ({
    success: t.boolean({ nullable: false }),
    message: t.string({ nullable: false }),
    batchId: t.string({ nullable: true }),
  }),
})
