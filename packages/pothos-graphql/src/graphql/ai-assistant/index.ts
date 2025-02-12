import { builder } from '../builder'
import { prisma } from '../../prisma'

console.log('Setting up: AiAssistant')

export enum AiAssistantType {
  CHATBOT = 'CHATBOT',
  DOCUMENT_GENERATOR = 'DOCUMENT_GENERATOR',
}

export const AiAssistantTypeEnum = builder.enumType(AiAssistantType, {
  name: 'AiAssistantType',
  description: 'Type of the AiAssistant',
})

export const AiAssistant = builder.prismaObject('AiAssistant', {
  name: 'AiAssistant',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    description: t.exposeString('description'),
    url: t.exposeString('url'),
    icon: t.exposeString('icon'),
    assistantType: t.field({
      type: AiAssistantTypeEnum,
      nullable: false,
      select: { assistantType: true },
      resolve: (assistant) => {
        return AiAssistantType[assistant.assistantType]
      },
    }),
    ownerId: t.exposeID('ownerId', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
  }),
})

const AiAssistantInput = builder.inputType('AiAssistantInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    description: t.string({ required: false }),
    url: t.string({ required: false }),
    icon: t.string({ required: false }),
    assistantType: t.field({
      type: AiAssistantTypeEnum,
      required: true,
    }),
  }),
})

builder.queryField('aiAssistant', (t) =>
  t.prismaField({
    type: 'AiAssistant',
    args: {
      id: t.arg.string(),
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
      return prisma.aiAssistant.update({
        ...query,
        where: { id },
        data,
      })
    },
  }),
)

builder.mutationField('createAiAssistant', (t) =>
  t.prismaField({
    type: 'AiAssistant',
    args: {
      ownerId: t.arg.string({ required: true }),
      data: t.arg({ type: AiAssistantInput, required: true }),
    },
    resolve: async (_query, _source, { ownerId, data }) => {
      const owner = await prisma.user.findFirst({
        where: { id: ownerId },
      })
      if (!owner) {
        throw new Error(`User with id ${ownerId} not found`)
      }

      return prisma.aiAssistant.create({
        data: { ...data, ownerId },
      })
    },
  }),
)
