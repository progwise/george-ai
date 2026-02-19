import { ActionConfigValue } from '@george-ai/connector-types'

import { builder } from '../builder'

// Generic action config types
builder.objectRef<ActionConfigValue>('ConnectorActionConfigValue').implement({
  description: 'A key-value pair for action configuration',
  fields: (t) => ({
    key: t.exposeString('key', { nullable: false }),
    value: t.exposeString('value', { nullable: true }),
  }),
})
