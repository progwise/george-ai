import { prisma } from '../../prisma'
import { builder } from '../builder'

export const AiLibraryUsage = builder.prismaObject('AiLibraryUsage', {
  name: 'AiLibraryUsage',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    assistantId: t.exposeID('assistantId', { nullable: false }),
    libraryId: t.exposeID('libraryId', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    assistant: t.relation('assistant', { nullable: false }),
    library: t.relation('library', { nullable: false }),
    usedFor: t.exposeString('usedFor'),
  }),
})

const AiLibraryUsageInput = builder.inputType('AiLibraryUsageInput', {
  fields: (t) => ({
    libraryId: t.string({ required: true }),
    usedFor: t.string({ required: false }),
  }),
})

builder.queryField('aiLibraryUsage', (t) =>
  t.prismaField({
    type: ['AiLibraryUsage'],
    args: {
      assistantId: t.arg.string({ required: false }),
      libraryId: t.arg.string({ required: false }),
    },
    resolve: (query, _source, { assistantId, libraryId }) => {
      if (!assistantId && !libraryId) {
        throw new Error('assistantId or libraryId must be provided')
      }
      return prisma.aiLibraryUsage.findMany({
        ...query,
        where: {
          ...(assistantId && { assistantId }),
          ...(libraryId && { libraryId }),
        },
      })
    },
  }),
)

builder.mutationField('addLibraryUsage', (t) =>
  t.prismaField({
    type: 'AiLibraryUsage',
    args: {
      assistantId: t.arg.string({ required: true }),
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, args) => {
      const { assistantId, libraryId } = args
      const existing = await prisma.aiLibraryUsage.findFirst({
        where: { assistantId, libraryId },
      })
      if (existing) {
        throw new Error('Library usage already exists')
      }
      const result = await prisma.aiLibraryUsage.create({
        ...query,
        data: { assistantId, libraryId },
      })
      return result
    },
  }),
)

builder.mutationField('removeLibraryUsage', (t) =>
  t.prismaField({
    type: 'AiLibraryUsage',
    args: {
      assistantId: t.arg.string({ required: true }),
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, args) => {
      const { assistantId, libraryId } = args
      const existing = await prisma.aiLibraryUsage.findFirst({
        where: { assistantId, libraryId },
      })
      if (!existing) {
        throw new Error('Library usage does not exist')
      }
      const result = await prisma.aiLibraryUsage.delete({
        ...query,
        where: { assistantId_libraryId: { assistantId, libraryId } },
      })
      return result
    },
  }),
)

builder.mutationField('updateLibraryUsage', (t) =>
  t.prismaField({
    type: 'AiLibraryUsage',
    args: {
      id: t.arg.string({ required: true }),
      usedFor: t.arg.string({ required: false }),
    },
    resolve: async (query, _source, args) => {
      const { id, usedFor } = args
      const existing = await prisma.aiLibraryUsage.findFirst({
        where: { id },
      })
      if (!existing) {
        throw new Error('Library usage does not exist')
      }
      const result = await prisma.aiLibraryUsage.update({
        ...query,
        where: { id },
        data: { usedFor },
      })
      return result
    },
  }),
)

builder.mutationField('updateLibraryUsages', (t) =>
  t.prismaField({
    type: ['AiLibraryUsage'],
    args: {
      assistantId: t.arg.string({ required: true }),
      usages: t.arg({ type: [AiLibraryUsageInput], required: true }),
    },
    resolve: async (query, _source, args) => {
      const assistantId = args.assistantId

      const result = await prisma.$transaction(async (tx) => {
        await tx.aiLibraryUsage.deleteMany({
          where: { assistantId },
        })
        return Promise.all(
          args.usages.map((usage) => {
            const libraryId = usage.libraryId
            return tx.aiLibraryUsage.upsert({
              ...query,
              where: { assistantId_libraryId: { assistantId, libraryId } },
              create: { ...usage, assistantId },
              update: { ...usage },
            })
          }),
        )
      })
      return result
    },
  }),
)
