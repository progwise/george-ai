import { builder } from '../../builder'

// Input type for creating/updating automations
export const automationInputType = builder.inputType('AutomationInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    listId: t.string({ required: true }),
    connectorId: t.string({ required: true }),
    connectorAction: t.string({ required: false }), // Optional - uses first action if not provided
    actionConfig: t.string({ required: false }), // JSON string - uses default if not provided
    filter: t.string({ required: false }), // JSON string for filter criteria
    schedule: t.string({ required: false }), // CRON expression
    executeOnEnrichment: t.boolean({ required: false }),
  }),
})
