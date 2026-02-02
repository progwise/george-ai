import { prisma } from '../../../../app-database/src'
import { canAdminWorkspaceOrThrow, canWriteWorkspaceOrThrow } from '../workspace'
import { createListItemsForSource } from './../../domain'
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
    resolve: async (query, _source, { data }, context) => {
      const workspaceId = context.workspaceId
      await canWriteWorkspaceOrThrow(workspaceId, context.session.user.id)
      const existingList = await prisma.aiList.findFirst({
        where: { ownerId: context.session.user.id, name: data.name, workspaceId: context.workspaceId },
      })
      if (existingList) {
        throw new Error(`List for current user with name ${data.name} already exists`)
      }
      const newList = await prisma.aiList.create({
        ...query,
        data: { name: data.name, ownerId: context.session.user.id, workspaceId: context.workspaceId },
      })
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
    resolve: async (query, _source, { id, data }, context) => {
      const workspaceId = context.workspaceId
      await canWriteWorkspaceOrThrow(workspaceId, context.session.user.id)
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
    resolve: async (query, _source, { id }, { session, workspaceId }) => {
      await canAdminWorkspaceOrThrow(workspaceId, session.user.id)

      const result = await prisma.$transaction(async (prisma) => {
        // Delete related data first due to foreign key constraints
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
    resolve: async (query, _source, { listId, data }, { workspaceId, session }) => {
      await canAdminWorkspaceOrThrow(workspaceId, session.user.id)

      // Check if library exists and user has access (via workspace membership or public)
      const library = await prisma.aiLibrary.findFirst({
        where: {
          workspaceId,
          id: data.libraryId,
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
        { property: 'itemName', name: 'Item Name', type: 'string' },
        { property: 'source', name: 'Source', type: 'string' },
        { property: 'name', name: 'Filename', type: 'string' },
        { property: 'originUri', name: 'Origin URI', type: 'string' },
        { property: 'crawlerUrl', name: 'Crawler URL', type: 'string' },
        { property: 'extractedAt', name: 'Extracted At', type: 'datetime' },
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

      // Create list items for all files in the library based on extraction strategy
      await createListItemsForSource(newSource.id)

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
    resolve: async (query, _source, { id }, { workspaceId, session }) => {
      await canAdminWorkspaceOrThrow(workspaceId, session.user.id)
      const existingSource = await prisma.aiListSource.findFirstOrThrow({
        ...query,
        where: { id, list: { workspaceId } },
      })

      await prisma.aiListSource.delete({ where: { id } })
      return existingSource
    },
  }),
)

builder.mutationField('reorderListFields', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiListField'],
    nullable: false,
    args: {
      fieldId: t.arg.string({ required: true }),
      newPlace: t.arg.int({ required: true }),
    },
    resolve: async (query, _source, { fieldId, newPlace }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      const field = await prisma.aiListField.findUniqueOrThrow({
        where: { id: fieldId, list: { workspaceId } },
        select: { id: true, listId: true },
      })

      if (newPlace < 0) {
        throw new Error('newPlace must be 0 or greater')
      }

      const allFields = await prisma.aiListField.findMany({
        where: { listId: field.listId },
        orderBy: { order: 'asc' },
        select: { id: true },
      })

      const currentIndex = allFields.findIndex((f) => f.id === fieldId)
      if (currentIndex === -1) {
        throw new Error('Field not found in its own list?')
      }

      // Remove the field from its current position
      allFields.splice(currentIndex, 1)
      // Insert the field at the new position
      allFields.splice(newPlace, 0, field)

      // Reassign orders
      const updatedFields = await Promise.all(
        allFields.map((f, index) =>
          prisma.aiListField.update({
            where: { id: f.id },
            data: { order: index },
            ...query,
          }),
        ),
      )

      return updatedFields
    },
  }),
)
