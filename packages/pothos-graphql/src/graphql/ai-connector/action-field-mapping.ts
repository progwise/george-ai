import { ActionFieldMapping } from '@george-ai/connector-types'

import { builder } from '../builder'

builder.objectRef<ActionFieldMapping>('ConnectorActionFieldMapping').implement({
  description: 'Maps a source enrichment field to a target field with transform',
  fields: (t) => ({
    sourceFieldId: t.exposeString('sourceFieldId', { nullable: false }),
    targetField: t.exposeString('targetField', { nullable: false }),
    transform: t.exposeString('transform', { nullable: false }),
  }),
})
