import { builder } from '../builder'
import { prisma } from '../../prisma'

export const AiLibraryUsage = builder.prismaObject('AiLibraryUsage', {
  name: 'AiLibraryUsage',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    assistantId: t.exposeID('assistantId', { nullable: false }),
    libraryId: t.exposeID('libraryId', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    assistant: t.relation('assistant'),
    library: t.relation('library'),
  }),
})

const AiLibraryUsageInput = builder.inputType('AiLibraryUsageInput', {
  fields: (t) => ({
    assistantId: t.string({ required: true }),
    libraryId: t.string({ required: true }),
    use: t.boolean({ required: true }),
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
        throw new Error('aiAssistantId or libraryId must be provided')
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

builder.objectType('AiLibraryUsageResult', {
  fields: (t) => ({
    usageId: t.exposeString('usageId', { nullable: true }),
    deletedCount: t.exposeInt('deletedCount', { nullable: true }),
  }),
})

builder.mutationField('updateLibraryUsage', (t) =>
  t.field({
    type: 'AiLibraryUsageResult',
    args: { data: t.arg({ type: AiLibraryUsageInput, required: true }) },
    resolve: async (_parent, { data }) => {
      const { assistantId, libraryId, use } = data
      const assistant = await prisma.aiAssistant.findUnique({
        select: { id: true },
        where: { id: assistantId },
      })
      if (!assistant) {
        throw new Error(`Assistant not found: ${assistantId}`)
      }
      const library = await prisma.aiLibrary.findUnique({
        select: { id: true },
        where: { id: libraryId },
      })
      if (!library) {
        throw new Error(`Library not found: ${libraryId}`)
      }
      if (!use) {
        const deleteResult = await prisma.aiLibraryUsage.deleteMany({
          where: { assistantId, libraryId },
        })
        return { deletedCount: deleteResult.count, usageId: null }
      }

      const existingUsage = await prisma.aiLibraryUsage.findFirst({
        where: { assistantId, libraryId },
      })

      if (existingUsage) {
        return { usageId: existingUsage.id, deletedCount: null }
      }

      const newUsage = await prisma.aiLibraryUsage.create({
        data: { assistantId, libraryId },
      })
      return { usageId: newUsage.id, deletedCount: null }
    },
  }),
)
