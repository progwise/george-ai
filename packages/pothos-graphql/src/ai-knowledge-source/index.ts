import { builder } from '../builder'
import { prisma } from '../prisma'

console.log('Setting up: AiKnowledgeSource')

export enum AiKnowledgeSourceType {
  GOOGLE_DRIVE = 'GOOGLE_DRIVE',
  POCKETBASE = 'POCKETBASE',
}

export const AiKnowledgeSourceTypeEnum = builder.enumType(
  AiKnowledgeSourceType,
  {
    name: 'AiKnowledgeSourceType',
    description: 'Type of the AiKnowledgeSource',
  },
)

export const AiKnowledgeSource = builder.prismaObject('AiKnowledgeSource', {
  name: 'AiKnowledgeSource',
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    description: t.exposeString('description'),
    url: t.exposeString('url'),
    aiKnowledgeSourceType: t.field({
      type: AiKnowledgeSourceTypeEnum,
      nullable: false,
      select: { assistantType: true },
      resolve: (knowledgeSource) => {
        return AiKnowledgeSourceType[knowledgeSource.aiKnowledgeSourceType]
      },
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
  }),
})

const AiKnowledgeSourceInput = builder.inputType('AiKnowledgeSourceInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    description: t.string({ required: false }),
    url: t.string({ required: false }),
    icon: t.string({ required: false }),
    aiKnowledgeSourceType: t.field({
      type: AiKnowledgeSourceTypeEnum,
      required: true,
    }),
  }),
})

builder.queryField('aiKnowledgeSource', (t) =>
  t.prismaField({
    type: 'AiKnowledgeSource',
    args: {
      id: t.arg.string(),
    },
    resolve: (query, _source, { id }) => {
      return prisma.aiKnowledgeSource.findUnique({
        ...query,
        where: { id },
      })
    },
  }),
)

builder.queryField('aiKnowledgeSources', (t) =>
  t.prismaField({
    type: ['AiKnowledgeSource'],
    args: {
      ownerId: t.arg.string(),
    },
    resolve: (query, _source, { ownerId }) => {
      return prisma.aiKnowledgeSource.findMany({
        ...query,
        where: { ownerId },
      })
    },
  }),
)

builder.mutationField('createAiKnowledgeSource', (t) =>
  t.prismaField({
    type: 'AiKnowledgeSource',
    args: {
      ownerId: t.arg.string(),
      data: t.arg({ type: AiKnowledgeSourceInput, required: true }),
    },
    resolve: (query, _source, { ownerId, data }) => {
      return prisma.aiKnowledgeSource.create({
        ...query,
        data: {
          ...data,
          ownerId,
        },
      })
    },
  }),
)
