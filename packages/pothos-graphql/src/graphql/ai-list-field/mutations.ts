import { canAccessListOrThrow } from './../../domain'
import { prisma } from './../../prisma'
import { builder } from './../builder'

// Context source input for field references or external context
const AiListFieldContextInput = builder.inputType('AiListFieldContextInput', {
  fields: (t) => ({
    contextType: t.field({ type: 'ListFieldContextType', required: true }),
    contextFieldId: t.string({ required: false }),
    contextQuery: t.string({ required: false }),
    maxContentTokens: t.int({ required: false }),
  }),
})

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
    languageModelId: t.string({ required: false }),
    contextSources: t.field({ type: [AiListFieldContextInput], required: false }),
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

      const newField = await prisma.aiListField.create({
        ...query,
        data: {
          name: data.name,
          type: data.type,
          order: data.order ?? undefined,
          sourceType: data.sourceType,
          fileProperty: data.fileProperty,
          prompt: data.prompt,
          failureTerms: data.failureTerms,
          languageModelId: data.languageModelId || null,
          listId: existingList.id,
        },
      })

      // Create context sources if provided
      if (data.contextSources && data.contextSources.length > 0) {
        const contextData = data.contextSources.map((source) => ({
          fieldId: newField.id,
          contextType: source.contextType,
          contextFieldId: source.contextFieldId || null,
          contextQuery: source.contextQuery ? JSON.parse(source.contextQuery) : null,
          maxContentTokens: source.maxContentTokens || null,
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

      const updatedField = await prisma.aiListField.update({
        ...query,
        where: { id },
        data: {
          name: data.name,
          type: data.type,
          order: data.order ?? undefined,
          sourceType: data.sourceType,
          fileProperty: data.fileProperty,
          prompt: data.prompt,
          failureTerms: data.failureTerms,
          languageModelId: data.languageModelId || null,
        },
      })

      // Update context sources
      // First, delete existing context sources
      await prisma.aiListFieldContext.deleteMany({
        where: { fieldId: id },
      })

      // Then create new context sources if provided
      if (data.contextSources && data.contextSources.length > 0) {
        const contextData = data.contextSources.map((source) => ({
          fieldId: id,
          contextType: source.contextType,
          contextFieldId: source.contextFieldId || null,
          contextQuery: source.contextQuery ? JSON.parse(source.contextQuery) : null,
          maxContentTokens: source.maxContentTokens || null,
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
      itemId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { fieldId, itemId }, { session }) => {
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

        // Get the item with its source file
        const item = await prisma.aiListItem.findFirstOrThrow({
          where: { id: itemId },
          include: { sourceFile: { include: { library: true } } },
        })

        // Check access to the list
        await canAccessListOrThrow(field.listId, session.user.id)

        // TODO: Read the converted.md file content and use LLM to compute the value
        // For now, return a placeholder
        const mockValue = `[${field.type}] Computed value for ${item.sourceFile.name}`

        // Cache the computed value
        await prisma.aiListItemCache.upsert({
          where: {
            itemId_fieldId: {
              itemId: itemId,
              fieldId: fieldId,
            },
          },
          create: {
            itemId: itemId,
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
