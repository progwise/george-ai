import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiAssistant mutations')

const AiAssistantInput = builder.inputType('AiAssistantInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    description: t.string({ required: false }),
    url: t.string({ required: false }),
    icon: t.string({ required: false }),
    languageModelId: t.string({ required: false }),
  }),
})

builder.mutationField('deleteAiAssistant', (t) =>
  t.prismaField({
    type: 'AiAssistant',
    args: {
      assistantId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { assistantId }) => {
      return prisma.aiAssistant.delete({
        ...query,
        where: { id: assistantId },
      })
    },
  }),
)

builder.mutationField('updateAiAssistant', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiAssistant',
    args: {
      id: t.arg.string({ required: true }),
      data: t.arg({ type: AiAssistantInput, required: true }),
    },
    resolve: async (query, _source, { id, data }) => {
      const result = await prisma.aiAssistant.update({
        ...query,
        where: { id },
        data,
      })
      return result
    },
  }),
)

builder.mutationField('createAiAssistant', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiAssistant',
    args: {
      name: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { name }, context) => {
      const userId = context.session.user.id
      if (!context.workspaceId) {
        throw new Error('No workspace context')
      }
      return prisma.aiAssistant.create({
        ...query,
        data: {
          name,
          ownerId: userId,
          workspaceId: context.workspaceId,
        },
      })
    },
  }),
)

const BaseCaseInputType = builder.inputType('AiBaseCaseInputType', {
  fields: (t) => ({
    id: t.string({ required: false }),
    sequence: t.float({ required: false }),
    condition: t.string({ required: false }),
    instruction: t.string({ required: false }),
  }),
})

builder.mutationField('upsertAiBaseCases', (t) =>
  t.prismaField({
    type: ['AiAssistantBaseCase'],
    args: {
      assistantId: t.arg.string({ required: true }),
      baseCases: t.arg({ type: [BaseCaseInputType], required: true }),
    },
    resolve: async (query, _source, { assistantId, baseCases }) => {
      const assistant = await prisma.aiAssistant.findUnique({
        where: { id: assistantId },
        include: { baseCases: true },
      })

      if (!assistant) {
        throw new Error(`Assistant with id ${assistantId} not found`)
      }

      const baseCasesToDeleteNoDescription = baseCases.filter(
        (bc) => bc.id && (!bc.condition || bc.condition.length < 1) && (!bc.instruction || bc.instruction.length < 1),
      )
      await prisma.aiAssistantBaseCase.deleteMany({
        where: { id: { in: baseCasesToDeleteNoDescription.map((bc) => bc.id!) } },
      })

      const filteredBaseCases = baseCases.filter(
        (baseCase) =>
          (baseCase.condition && baseCase.condition.length > 0) ||
          (baseCase.instruction && baseCase.instruction.length > 0),
      )

      let sequence = 0
      for (const baseCase of filteredBaseCases) {
        sequence = sequence + 1
        baseCase.sequence = sequence
        if (baseCase.id) {
          await prisma.aiAssistantBaseCase.update({
            ...query,
            where: { id: baseCase.id },
            data: {
              sequence: baseCase.sequence,
              condition: baseCase.condition,
              instruction: baseCase.instruction,
            },
          })
        } else {
          await prisma.aiAssistantBaseCase.create({
            ...query,
            data: {
              sequence: baseCase.sequence,
              condition: baseCase.condition,
              instruction: baseCase.instruction,
              assistantId,
            },
          })
        }
      }

      return prisma.aiAssistantBaseCase.findMany({
        ...query,
        where: { assistantId },
        orderBy: { sequence: 'asc' },
      })
    },
  }),
)
