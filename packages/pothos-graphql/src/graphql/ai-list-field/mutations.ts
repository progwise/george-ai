import { canAccessListOrThrow } from './../../domain'
import { prisma } from './../../prisma'
import { builder } from './../builder'

// List Field mutations
const AiListFieldInput = builder.inputType('AiListFieldInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    type: t.field({
      required: true,
      description: 'Field type: string, text, number, date, datetime, boolean',
      type: 'ListFieldType',
    }),
    order: t.int({ required: false }),
    sourceType: t.field({
      type: 'ListFieldSourceType',
      required: true,
      description: 'Source type: file_property or llm_computed',
    }),
    fileProperty: t.string({ required: false }),
    prompt: t.string({ required: false }),
    failureTerms: t.string({ required: false }),
    contentQuery: t.string({ required: false }),
    languageModel: t.string({ required: false }),
    useVectorStore: t.boolean({ required: false }),
    context: t.stringList({ required: false }),
  }),
})

builder.mutationField('addListField', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiListField',
    nullable: false,
    args: {
      listId: t.arg.string({ required: true }),
      data: t.arg({ type: AiListFieldInput, required: true }),
    },
    resolve: async (query, _source, { listId, data }, { session }) => {
      const existingList = await prisma.aiList.findFirstOrThrow({
        where: { id: listId },
      })
      await canAccessListOrThrow(existingList.id, session.user.id)

      const { languageModel, ...restData } = data

      // Look up the model by name if provided
      let languageModelId: string | null = null
      if (languageModel) {
        const model = await prisma.aiLanguageModel.findUnique({
          where: { provider_name: { provider: 'ollama', name: languageModel } },
        })
        if (model) {
          languageModelId = model.id
        }
      }

      const newField = await prisma.aiListField.create({
        ...query,
        data: {
          listId,
          name: restData.name,
          type: restData.type,
          order: restData.order || 0,
          sourceType: restData.sourceType,
          fileProperty: restData.fileProperty,
          prompt: restData.prompt,
          failureTerms: restData.failureTerms,
          contentQuery: restData.contentQuery,
          languageModelId,
          useVectorStore: restData.useVectorStore,
        },
      })

      // Create context relations if context field IDs are provided
      if (data.context && data.context.length > 0) {
        const contextData = data.context.map((contextFieldId) => ({
          fieldId: newField.id,
          contextFieldId,
        }))

        await prisma.aiListFieldContext.createMany({
          data: contextData,
        })
      }

      return newField
    },
  }),
)

builder.mutationField('updateListField', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiListField',
    nullable: false,
    args: {
      id: t.arg.string({ required: true }),
      data: t.arg({ type: AiListFieldInput, required: true }),
    },
    resolve: async (query, _source, { id, data }, { session }) => {
      const existingField = await prisma.aiListField.findFirstOrThrow({
        where: { id },
      })
      await canAccessListOrThrow(existingField.listId, session.user.id)

      const { languageModel, ...restData } = data

      // Look up the model by name if provided
      let languageModelId: string | null = null
      if (languageModel) {
        const model = await prisma.aiLanguageModel.findUnique({
          where: { provider_name: { provider: 'ollama', name: languageModel } },
        })
        if (model) {
          languageModelId = model.id
        }
      }

      const updatedField = await prisma.aiListField.update({
        ...query,
        where: { id },
        data: {
          name: restData.name,
          type: restData.type,
          order: restData.order ?? undefined,
          sourceType: restData.sourceType,
          fileProperty: restData.fileProperty,
          prompt: restData.prompt,
          failureTerms: restData.failureTerms,
          contentQuery: restData.contentQuery,
          languageModelId,
          useVectorStore: restData.useVectorStore,
        },
      })

      // Update context relations
      // First, delete existing context relations
      await prisma.aiListFieldContext.deleteMany({
        where: { fieldId: id },
      })

      // Then create new context relations if provided
      if (data.context && data.context.length > 0) {
        const contextData = data.context.map((contextFieldId) => ({
          fieldId: id,
          contextFieldId,
        }))

        await prisma.aiListFieldContext.createMany({
          data: contextData,
        })
      }

      return updatedField
    },
  }),
)

builder.mutationField('removeListField', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiListField',
    nullable: false,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { id }, { session }) => {
      const existingField = await prisma.aiListField.findFirstOrThrow({
        ...query,
        where: { id },
      })
      await canAccessListOrThrow(existingField.listId, session.user.id)

      await prisma.aiListField.delete({ where: { id } })
      return existingField
    },
  }),
)

// Define the result type for computing field values
const ComputeFieldValueResult = builder
  .objectRef<{
    success: boolean
    value?: string | null
    error?: string | null
  }>('ComputeFieldValueResult')
  .implement({
    fields: (t) => ({
      success: t.exposeBoolean('success'),
      value: t.exposeString('value', { nullable: true }),
      error: t.exposeString('error', { nullable: true }),
    }),
  })

builder.mutationField('computeFieldValue', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ComputeFieldValueResult,
    args: {
      fieldId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { fieldId, fileId }, { session }) => {
      try {
        // Get the field
        const field = await prisma.aiListField.findFirst({
          where: { id: fieldId },
        })
        if (!field) {
          throw new Error(`Field with id ${fieldId} not found`)
        }
        await canAccessListOrThrow(field.listId, session.user.id)

        // Only compute for LLM fields
        if (field.sourceType !== 'llm_computed') {
          throw new Error('Can only compute values for LLM computed fields')
        }

        // Get the file
        const file = await prisma.aiLibraryFile.findFirstOrThrow({
          where: { id: fileId },
          include: { library: true },
        })

        // Check access to the library
        await canAccessListOrThrow(field.listId, session.user.id)

        // TODO: Read the converted.md file content and use LLM to compute the value
        // For now, return a placeholder
        const mockValue = `[${field.type}] Computed value for ${file.name}`

        // Cache the computed value
        await prisma.aiListItemCache.upsert({
          where: {
            fileId_fieldId: {
              fileId: fileId,
              fieldId: fieldId,
            },
          },
          create: {
            fileId: fileId,
            fieldId: fieldId,
            valueString: field.type === 'string' ? mockValue : null,
            valueNumber: field.type === 'number' ? 42 : null,
            valueBoolean: field.type === 'boolean' ? true : null,
            valueDate: field.type === 'date' || field.type === 'datetime' ? new Date() : null,
          },
          update: {
            valueString: field.type === 'string' ? mockValue : null,
            valueNumber: field.type === 'number' ? 42 : null,
            valueBoolean: field.type === 'boolean' ? true : null,
            valueDate: field.type === 'date' || field.type === 'datetime' ? new Date() : null,
          },
        })

        return {
          success: true,
          value: mockValue,
          error: null,
        }
      } catch (error) {
        console.error('Error computing field value:', error)
        return {
          success: false,
          value: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  }),
)
