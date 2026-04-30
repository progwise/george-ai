import { builder } from '../builder'

builder.inputType('InferenceHostInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    baseUrl: t.string({ required: false }),
    apiKey: t.string({ required: false }),
    vramGb: t.int({ required: false }),
  }),
})

export interface InferenceHostInput {
  name: string
  baseUrl?: string
  apiKey?: string
  vramGb?: number
}
