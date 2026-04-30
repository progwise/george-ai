import { builder } from '../builder'

builder.inputType('DateTimePeriod', {
  fields: (t) => ({
    earliest: t.field({ type: 'DateTime', required: false }),
    latest: t.field({ type: 'DateTime', required: false }),
  }),
})

export type DateTimePeriod = { earliest?: Date | null; latest?: Date | null }
