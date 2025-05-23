import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiAssistant')

export const AiAssistantBaseCase = builder.prismaObject('AiAssistantBaseCase', {
  name: 'AiAssistantBaseCase',
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    sequence: t.exposeFloat('sequence'),
    condition: t.exposeString('condition'),
    instruction: t.exposeString('instruction'),
    assistant: t.relation('assistant'),
  }),
})

export const AiAssistant = builder.prismaObject('AiAssistant', {
  name: 'AiAssistant',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    description: t.exposeString('description'),
    url: t.exposeString('url'),
    iconUrl: t.exposeString('iconUrl'),
    ownerId: t.exposeID('ownerId', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    languageModel: t.expose('languageModel', { type: 'String' }),
    baseCases: t.relation('baseCases', { nullable: false, query: () => ({ orderBy: [{ sequence: 'asc' }] }) }),
    participants: t.prismaField({
      type: ['User'],
      nullable: false,
      select: { participants: { select: { user: true } } },
      resolve: (_query, assistant) => {
        return assistant.participants.map((participant) => participant.user)
      },
    }),
  }),
})

const AiAssistantInput = builder.inputType('AiAssistantInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    description: t.string({ required: false }),
    url: t.string({ required: false }),
    icon: t.string({ required: false }),
    languageModel: t.string({ required: false }),
  }),
})

builder.queryField('aiAssistant', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiAssistant',
    args: {
      assistantId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { assistantId }, context) => {
      const user = context.session.user
      const assistant = await prisma.aiAssistant.findUnique({
        ...query,
        where: { id: assistantId },
        include: { participants: { include: { user: true } } },
      })
      if (!assistant) return null

      const isAuthorized =
        user.isAdmin ||
        assistant.ownerId === user.id ||
        (await prisma.aiAssistantParticipant.findFirst({ where: { assistantId, userId: user.id } })) != null

      if (!isAuthorized) return null
      return assistant
    },
  }),
)

builder.queryField('aiAssistants', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiAssistant'],
    nullable: {
      list: false,
      items: false,
    },
    resolve: (query, _source, _args, context) => {
      return prisma.aiAssistant.findMany({
        ...query,
        where: { participants: { some: { userId: context.session.user.id } } },
      })
    },
  }),
)

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
      return prisma.aiAssistant.create({
        ...query,
        data: {
          name,
          ownerId: userId,
          participants: {
            create: [{ userId }],
          },
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
