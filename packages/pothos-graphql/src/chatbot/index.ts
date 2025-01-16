import { builder } from '../builder'
import { prisma } from '../prisma'

console.log('Setting up: Chatbot')

export const Chatbot = builder.prismaObject('Chatbot', {
  name: 'Chatbot',
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    description: t.exposeString('description'),
    url: t.exposeString('url'),
    icon: t.exposeString('icon'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    //updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
  }),
})

const ChatbotInput = builder.inputType('ChatbotInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    description: t.string({ required: true }),
    url: t.string(),
    icon: t.string(),
  }),
})

builder.queryField('chatbot', (t) =>
  t.prismaField({
    type: 'Chatbot',
    args: {
      id: t.arg.string(),
    },
    resolve: (query, _source, { id }) => {
      return prisma.chatbot.findUnique({
        ...query,
        where: { id },
      })
    },
  }),
)

builder.queryField('chatbots', (t) =>
  t.prismaField({
    type: ['Chatbot'],
    args: {
      ownerId: t.arg.string(),
    },
    resolve: (query, _source, { ownerId }) => {
      return prisma.chatbot.findMany({
        ...query,
        where: { ownerId },
      })
    },
  }),
)

builder.mutationField('createChatbot', (t) =>
  t.prismaField({
    type: 'Chatbot',
    args: {
      ownerName: t.arg.string({ required: true }),
      input: t.arg({ type: ChatbotInput, required: true }),
    },
    resolve: async (query, _source, { ownerName, input }) => {
      const owner = await prisma.user.findFirst({
        where: { name: ownerName },
      })
      if (!owner) {
        throw new Error(`User with name ${ownerName} not found`)
      }

      const { name, description } = input
      return prisma.chatbot.create({
        data: {
          name,
          description,
          ownerId: owner.id,
        },
      })
    },
  }),
)
