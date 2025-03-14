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
    description: t.exposeString('description'),
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
    icon: t.exposeString('icon'),
    ownerId: t.exposeID('ownerId', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    languageModelId: t.expose('languageModelId', { type: 'String' }),
    languageModel: t.relation('languageModel'),
    llmTemperature: t.exposeFloat('llmTemperature'),
    baseCases: t.relation('baseCases', { nullable: false, query: () => ({ orderBy: [{ sequence: 'asc' }] }) }),
  }),
})

const AiAssistantInput = builder.inputType('AiAssistantInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    description: t.string({ required: false }),
    url: t.string({ required: false }),
    icon: t.string({ required: false }),
    languageModelId: t.string({ required: false }),
    llmTemperature: t.float({ required: false }),
  }),
})

builder.queryField('aiAssistant', (t) =>
  t.prismaField({
    type: 'AiAssistant',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (query, _source, { id }) => {
      return prisma.aiAssistant.findUnique({
        ...query,
        where: { id },
      })
    },
  }),
)

builder.queryField('aiAssistants', (t) =>
  t.prismaField({
    type: ['AiAssistant'],
    args: {
      ownerId: t.arg.string(),
    },
    nullable: {
      list: false,
      items: false,
    },
    resolve: (query, _source, { ownerId }) => {
      return prisma.aiAssistant.findMany({
        ...query,
        where: { ownerId },
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
  t.prismaField({
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
  t.prismaField({
    type: 'AiAssistant',
    args: {
      ownerId: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { ownerId, name }) => {
      const owner = await prisma.user.findFirst({
        where: { id: ownerId },
      })
      if (!owner) {
        throw new Error(`User with id ${ownerId} not found`)
      }

      return prisma.aiAssistant.create({
        data: { name, ownerId },
      })
    },
  }),
)
