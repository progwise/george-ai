import { getOCRModels } from '@george-ai/ai-service-client'

import { builder } from '../builder'

console.log('Setting up: ExtractionMethodRegistry')

// ExtractionMethod GraphQL Object
// const ExtractionMethod = builder
//   .objectRef<{
//     id: string
//     name: string
//     description: string
//     supportedMimeTypes: string[]
//     isEnabled: boolean
//     defaultOptions: Record<string, unknown>
//     optionsSchema: Record<string, unknown>
//   }>('ExtractionMethod')
//   .implement({
//     fields: (t) => ({
//       id: t.exposeString('id', { nullable: false }),
//       name: t.exposeString('name', { nullable: false }),
//       description: t.exposeString('description', { nullable: false }),
//       supportedMimeTypes: t.exposeStringList('supportedMimeTypes', { nullable: false }),
//       isEnabled: t.exposeBoolean('isEnabled', { nullable: false }),
//       defaultOptions: t.field({
//         type: 'String',
//         nullable: false,
//         resolve: (method) => JSON.stringify(method.defaultOptions),
//       }),
//       optionsSchema: t.field({
//         type: 'String',
//         nullable: false,
//         resolve: (method) => JSON.stringify(method.optionsSchema),
//       }),
//     }),
//   })

// MethodRegistry GraphQL Object
// const MethodRegistry = builder
//   .objectRef<{
//     mimeType: string
//     availableMethods: Array<{
//       id: string
//       name: string
//       description: string
//       supportedMimeTypes: string[]
//       isEnabled: boolean
//       defaultOptions: Record<string, unknown>
//       optionsSchema: Record<string, unknown>
//     }>
//   }>('MethodRegistry')
//   .implement({
//     fields: (t) => ({
//       mimeType: t.exposeString('mimeType', { nullable: false }),
//       availableMethods: t.field({
//         type: [ExtractionMethod],
//         nullable: false,
//         resolve: (registry) => registry.availableMethods,
//       }),
//     }),
//   })

// OCR Model GraphQL Object
const OCRModel = builder
  .objectRef<{
    name: string
    model: string
  }>('OCRModel')
  .implement({
    fields: (t) => ({
      name: t.exposeString('name', { nullable: false }),
      model: t.exposeString('model', { nullable: false }),
    }),
  })

// Query to get extraction method registry - DISABLED: functionality moved to file-converter package
// builder.queryField('extractionMethodRegistry', (t) =>
//   t.field({
//     type: [MethodRegistry],
//     nullable: false,
//     description: 'Get all available extraction methods grouped by mime type',
//     resolve: () => {
//       return getExtractionMethodRegistry()
//     },
//   }),
// )

// Query to get available OCR models
builder.queryField('availableOCRModels', (t) =>
  t.field({
    type: [OCRModel],
    nullable: false,
    description: 'Get all available OCR-capable vision models',
    resolve: async () => {
      return await getOCRModels()
    },
  }),
)
