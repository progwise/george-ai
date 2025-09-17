import { canAccessListOrThrow } from './../../domain'
import { prisma } from './../../prisma'
import { builder } from './../builder'

console.log('Setting up: AiList mutations')

const AiListInput = builder.inputType('AiListInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
  }),
})

builder.mutationField('createList', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiList',
    nullable: false,
    args: {
      data: t.arg({ type: AiListInput, required: true }),
    },
    resolve: async (query, _source, { data }, { session }) => {
      const existingList = await prisma.aiList.findFirst({ where: { ownerId: session.user.id, name: data.name } })
      if (existingList) {
        throw new Error(`List for current user with name ${data.name} already exists`)
      }
      const newList = await prisma.aiList.create({ ...query, data: { name: data.name, ownerId: session.user.id } })
      return newList
    },
  }),
)

builder.mutationField('updateList', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiList',
    args: {
      id: t.arg.string({ required: true }),
      data: t.arg({ type: AiListInput, required: true }),
    },
    resolve: async (query, _source, { id, data }, { session }) => {
      const existingList = await prisma.aiList.findFirst({
        include: { participants: true },
        where: { ownerId: session.user.id, id },
      })
      if (!existingList) {
        throw new Error(`List for current user with id ${id} not found`)
      }
      await canAccessListOrThrow(existingList.id, session.user.id)
      const updatedList = await prisma.aiList.update({ ...query, data, where: { id } })
      return updatedList
    },
  }),
)

builder.mutationField('deleteList', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiList',
    nullable: false,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { id }, { session }) => {
      await canAccessListOrThrow(id, session.user.id)

      const result = await prisma.$transaction(async (prisma) => {
        // Delete related data first due to foreign key constraints
        await prisma.aiListParticipant.deleteMany({ where: { listId: id } })
        await prisma.aiListFieldContext.deleteMany({ where: { field: { listId: id } } })
        await prisma.aiListField.deleteMany({ where: { listId: id } })
        await prisma.aiListItemCache.deleteMany({ where: { field: { listId: id } } })
        await prisma.aiEnrichmentTask.deleteMany({ where: { listId: id } })
        await prisma.aiListSource.deleteMany({ where: { listId: id } })
        const deletedList = await prisma.aiList.delete({ ...query, where: { id } })
        return deletedList
      })

      return result
    },
  }),
)

const UpdateListParticipantsResult = builder.simpleObject('UpdateListParticipantsResult', {
  fields: (t) => ({
    addedParticipants: t.int({ nullable: false }),
    removedParticipants: t.int({ nullable: false }),
    totalParticipants: t.int({ nullable: false }),
  }),
})

builder.mutationField('updateListParticipants', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: UpdateListParticipantsResult,
    nullable: false,
    args: {
      listId: t.arg.string({ required: true }),
      userIds: t.arg.stringList({ required: true }),
    },
    resolve: async (_source, { listId, userIds }, context) => {
      const list = await prisma.aiList.findUniqueOrThrow({
        where: { id: listId },
      })

      if (list.ownerId !== context.session.user.id) {
        throw new Error('Only the owner can add participants')
      }
      const existingParticipants = await prisma.aiListParticipant.findMany({
        include: { user: { select: { username: true } } },
        where: { listId },
      })

      const newUserIds = userIds.filter(
        (userId) => !existingParticipants.some((participant) => participant.userId === userId),
      )

      const removedUserIds = existingParticipants.map((p) => p.userId).filter((userId) => !userIds.includes(userId))

      const createdParticipants = await prisma.aiListParticipant.createMany({
        data: newUserIds.map((userId) => ({
          listId,
          userId,
        })),
      })

      const removedParticipants = await prisma.aiListParticipant.deleteMany({
        where: { listId, userId: { in: removedUserIds } },
      })

      const totalParticipants = await prisma.aiListParticipant.count({
        where: { listId },
      })

      return {
        addedParticipants: createdParticipants.count,
        removedParticipants: removedParticipants.count,
        totalParticipants,
      }
    },
  }),
)

builder.mutationField('removeListParticipant', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      listId: t.arg.string({ required: true }),
      participantId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { listId, participantId }, context) => {
      const currentUserId = context.session.user.id

      const participant = await prisma.aiListParticipant.findUniqueOrThrow({
        where: { id: participantId, listId },
        select: { listId: true, userId: true, list: { select: { ownerId: true } } },
      })

      const isOwner = participant.list.ownerId === currentUserId
      const isSelf = participant.userId === currentUserId

      if (!isOwner && !isSelf) {
        throw new Error('Only the owner can remove other participants')
      }

      await prisma.aiListParticipant.delete({
        where: { id: participantId },
      })

      return true
    },
  }),
)

const AiListSourceInput = builder.inputType('AiListSourceInput', {
  fields: (t) => ({
    libraryId: t.string({ required: true }),
  }),
})

builder.mutationField('addListSource', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiListSource',
    nullable: false,
    args: {
      listId: t.arg.string({ required: true }),
      data: t.arg({ type: AiListSourceInput, required: true }),
    },
    resolve: async (query, _source, { listId, data }, { session }) => {
      const existingList = await prisma.aiList.findFirstOrThrow({
        where: { id: listId },
      })
      canAccessListOrThrow(existingList.id, session.user.id)

      // Check if library exists and user has access
      const library = await prisma.aiLibrary.findFirst({
        where: {
          id: data.libraryId,
          OR: [
            { ownerId: session.user.id },
            { isPublic: true },
            { participants: { some: { userId: session.user.id } } },
          ],
        },
      })
      if (!library) {
        throw new Error(`Library with id ${data.libraryId} not found or access denied`)
      }

      // Check if source already exists
      const existingSource = await prisma.aiListSource.findFirst({
        where: { listId, libraryId: data.libraryId },
      })
      if (existingSource) {
        throw new Error(`Library is already added as a source to this list`)
      }

      const newSource = await prisma.aiListSource.create({
        ...query,
        data: {
          listId,
          libraryId: data.libraryId,
        },
      })

      // Auto-create file property fields for this list if they don't exist
      const filePropertyFields = [
        { property: 'source', name: 'Source', type: 'string' },
        { property: 'name', name: 'Filename', type: 'string' },
        { property: 'originUri', name: 'Origin URI', type: 'string' },
        { property: 'crawlerUrl', name: 'Crawler URL', type: 'string' },
        { property: 'processedAt', name: 'Processed At', type: 'datetime' },
        { property: 'originModificationDate', name: 'Last Update', type: 'datetime' },
        { property: 'size', name: 'File Size', type: 'number' },
        { property: 'mimeType', name: 'MIME Type', type: 'string' },
      ]

      // Check which fields already exist
      const existingFields = await prisma.aiListField.findMany({
        where: {
          listId,
          sourceType: 'file_property',
        },
      })

      const existingProperties = new Set(existingFields.map((f) => f.fileProperty))

      // Create missing file property fields
      const fieldsToCreate = filePropertyFields.filter((f) => !existingProperties.has(f.property))

      if (fieldsToCreate.length > 0) {
        // Get max order to add new fields at the end
        const maxOrderField = await prisma.aiListField.findFirst({
          where: { listId },
          orderBy: { order: 'desc' },
        })
        const startOrder = (maxOrderField?.order ?? -1) + 1

        await prisma.aiListField.createMany({
          data: fieldsToCreate.map((field, index) => ({
            listId,
            name: field.name,
            type: field.type,
            order: startOrder + index,
            sourceType: 'file_property',
            fileProperty: field.property,
          })),
        })
      }

      return newSource
    },
  }),
)

builder.mutationField('removeListSource', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiListSource',
    nullable: false,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { id }, { session }) => {
      const existingSource = await prisma.aiListSource.findFirstOrThrow({
        ...query,
        where: { id },
      })
      await canAccessListOrThrow(existingSource.listId, session.user.id)

      await prisma.aiListSource.delete({ where: { id } })
      return existingSource
    },
  }),
)

// List Field mutations
const AiListFieldInput = builder.inputType('AiListFieldInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    type: t.string({ required: true, description: 'Field type: string, number, date, datetime, boolean' }),
    order: t.int({ required: false }),
    sourceType: t.string({ required: true, description: 'Source type: file_property or llm_computed' }),
    fileProperty: t.string({ required: false }),
    prompt: t.string({ required: false }),
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

      // Validate field type
      const validTypes = ['string', 'number', 'date', 'datetime', 'boolean']
      if (!validTypes.includes(data.type)) {
        throw new Error(`Invalid field type: ${data.type}. Must be one of: ${validTypes.join(', ')}`)
      }

      const newField = await prisma.aiListField.create({
        ...query,
        data: {
          listId,
          name: data.name,
          type: data.type,
          order: data.order || 0,
          sourceType: data.sourceType,
          fileProperty: data.fileProperty,
          prompt: data.prompt,
          contentQuery: data.contentQuery,
          languageModel: data.languageModel,
          useVectorStore: data.useVectorStore,
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

      // Validate field type if changed
      const validTypes = ['string', 'number', 'date', 'datetime', 'boolean']
      if (!validTypes.includes(data.type)) {
        throw new Error(`Invalid field type: ${data.type}. Must be one of: ${validTypes.join(', ')}`)
      }

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
          contentQuery: data.contentQuery,
          languageModel: data.languageModel,
          useVectorStore: data.useVectorStore,
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
