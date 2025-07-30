import {
  FileConverterOption,
  FileConverterOptionText,
  FileConverterOptions,
  getFileConverterOptions,
} from '@george-ai/file-converter'

import { builder } from '../builder'

const AiFileConverterOptionText = builder.objectRef<FileConverterOptionText>('AiFileConverterOptionText').implement({
  description: 'Text representation of a file converter option',
  fields: (t) => ({
    en: t.exposeString('en', { nullable: false }),
    de: t.exposeString('de', { nullable: false }),
  }),
})

const AiFileConverterOption = builder.objectRef<FileConverterOption>('AiFileConverterOption').implement({
  description: 'File converter option for AI Library',
  fields: (t) => ({
    name: t.exposeString('name', { nullable: false }),
    label: t.field({
      type: AiFileConverterOptionText,
      nullable: false,
      resolve: (parent) => parent.label,
    }),
    description: t.field({
      type: AiFileConverterOptionText,
      nullable: false,
      resolve: (parent) => parent.description,
    }),
  }),
})

const AiFileConverterOptionsSection = builder
  .objectRef<{
    title: FileConverterOptionText
    settings: FileConverterOption[]
  }>('AiFileConverterOptionsSection')
  .implement({
    description: 'Section of file converter options',
    fields: (t) => ({
      title: t.field({
        type: AiFileConverterOptionText,
        nullable: false,
        resolve: (parent) => parent.title,
      }),
      settings: t.field({
        type: [AiFileConverterOption],
        nullable: false,
        resolve: (parent) => parent.settings,
      }),
    }),
  })

const AiFileConverterOptions = builder.objectRef<FileConverterOptions>('AiFileConverterOptions').implement({
  description: 'Options for converting files in AI Library',
  fields: (t) => ({
    pdf: t.field({
      type: AiFileConverterOptionsSection,
      description: 'PDF processing options',
      nullable: false,
      resolve: (source) => source.pdf,
    }),
  }),
})

builder.queryField('aiFileConverterOptions', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: AiFileConverterOptions,
    nullable: false,
    resolve: async () => {
      const fileConverterOptions = getFileConverterOptions()
      return fileConverterOptions
    },
  }),
)
