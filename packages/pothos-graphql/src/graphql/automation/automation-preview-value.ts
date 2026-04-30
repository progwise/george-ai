import { AutomationPreviewValue } from '@george-ai/app-domain'

import { builder } from '../builder'

builder.objectRef<AutomationPreviewValue>('AutomationPreviewValue').implement({
  description: 'Preview of a value that will be written to the target system',
  fields: (t) => ({
    targetField: t.exposeString('targetField', { nullable: false }),
    value: t.exposeString('value', { nullable: true }),
    transformedValue: t.exposeString('transformedValue', { nullable: true }),
    isMissing: t.exposeBoolean('isMissing', { nullable: false }),
  }),
})
