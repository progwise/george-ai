import { ConnectorActionConfig } from '@george-ai/connector-types'

import { builder } from '../builder'

builder.objectRef<ConnectorActionConfig>('ConnectorActionConfig').implement({
  description: 'Generic configuration for connector actions',
  fields: (t) => ({
    values: t.field({
      type: ['ConnectorActionConfigValue'],
      nullable: { list: false, items: false },
      resolve: (config) => config.values,
    }),
    fieldMappings: t.field({
      type: ['ConnectorActionFieldMapping'],
      nullable: { list: false, items: false },
      resolve: (config) => config.fieldMappings,
    }),
  }),
})
