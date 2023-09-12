import SchemaBuilder from '@pothos/core'
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects'

export const builder = new SchemaBuilder<{
  DefaultInputFieldRequiredness: true
}>({
  defaultInputFieldRequiredness: true,

  plugins: [SimpleObjectsPlugin],
})

builder.queryType()
builder.mutationType()
