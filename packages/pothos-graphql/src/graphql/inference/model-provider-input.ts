import { builder } from '../builder'

// Input type for creating/updating AI service providers
builder.inputType('ModelProviderInput', {
  fields: (t) => ({
    provider: t.string({ required: true }),
    name: t.string({ required: true }),
    enabled: t.boolean({ required: false }),
    baseUrl: t.string({ required: false }),
    apiKey: t.string({ required: false }),
    vramGb: t.int({ required: false }),
  }),
})

export interface ModelProviderInput {
  provider: string
  name: string
  enabled?: boolean
  baseUrl?: string
  apiKey?: string
  vramGb?: number
}
