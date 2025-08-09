import { prisma } from '../../prisma'
import { builder } from '../builder'
import { canAccessListOrThrow } from './utils'

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
      console.log('mutation', data)
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
      canAccessListOrThrow(existingList, session.user)
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
      const existingList = await prisma.aiList.findFirst({
        ...query,
        include: { participants: true },
        where: { ownerId: session.user.id, id },
      })
      if (!existingList) {
        throw new Error(`List for current user with id ${id} not found`)
      }
      canAccessListOrThrow(existingList, session.user)
      await prisma.aiList.delete({ where: { id } })
      return existingList
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
      const existingList = await prisma.aiList.findFirst({
        include: { participants: true },
        where: { id: listId },
      })
      if (!existingList) {
        throw new Error(`List with id ${listId} not found`)
      }
      canAccessListOrThrow(existingList, session.user)

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
      const existingSource = await prisma.aiListSource.findFirst({
        ...query,
        where: { id },
        include: { list: { include: { participants: true } } },
      })
      if (!existingSource) {
        throw new Error(`List source with id ${id} not found`)
      }
      canAccessListOrThrow(existingSource.list, session.user)

      await prisma.aiListSource.delete({ where: { id } })
      return existingSource
    },
  }),
)
