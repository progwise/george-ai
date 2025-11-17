import { prisma } from '../../prisma'
import { builder } from '../builder'

// Input type for creating/updating AI service providers
const AiServiceProviderInput = builder.inputType('AiServiceProviderInput', {
  fields: (t) => ({
    provider: t.string({ required: true }),
    name: t.string({ required: true }),
    enabled: t.boolean({ required: false }),
    baseUrl: t.string({ required: false }),
    apiKey: t.string({ required: false }),
    vramGb: t.int({ required: false }),
  }),
})

// Create a new AI service provider
builder.mutationField('createAiServiceProvider', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiServiceProvider',
    nullable: false,
    args: {
      data: t.arg({ type: AiServiceProviderInput, required: true }),
    },
    resolve: async (query, _source, { data }, context) => {
      const userId = context.session.user.id

      // Check for duplicate (unique constraint: workspaceId + provider + name)
      const existing = await prisma.aiServiceProvider.findFirst({
        where: {
          workspaceId: context.workspaceId,
          provider: data.provider,
          name: data.name,
        },
      })

      if (existing) {
        throw new Error(
          `Provider '${data.provider}' with name '${data.name}' already exists in this workspace`,
        )
      }

      return prisma.aiServiceProvider.create({
        ...query,
        data: {
          workspaceId: context.workspaceId,
          provider: data.provider,
          name: data.name,
          enabled: data.enabled ?? true,
          baseUrl: data.baseUrl,
          apiKey: data.apiKey, // TODO: Encrypt before storing
          vramGb: data.vramGb,
          createdBy: userId,
        },
      })
    },
  }),
)

// Update an existing AI service provider
builder.mutationField('updateAiServiceProvider', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiServiceProvider',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
      data: t.arg({ type: AiServiceProviderInput, required: true }),
    },
    resolve: async (query, _source, { id, data }, context) => {
      const userId = context.session.user.id

      // Verify provider exists and belongs to workspace
      const existing = await prisma.aiServiceProvider.findFirst({
        where: {
          id: String(id),
          workspaceId: context.workspaceId,
        },
      })

      if (!existing) {
        throw new Error('Provider not found or access denied')
      }

      // Check for duplicate name if provider/name changed
      if (data.provider !== existing.provider || data.name !== existing.name) {
        const duplicate = await prisma.aiServiceProvider.findFirst({
          where: {
            workspaceId: context.workspaceId,
            provider: data.provider,
            name: data.name,
            id: { not: String(id) },
          },
        })

        if (duplicate) {
          throw new Error(
            `Provider '${data.provider}' with name '${data.name}' already exists in this workspace`,
          )
        }
      }

      return prisma.aiServiceProvider.update({
        ...query,
        where: { id: String(id) },
        data: {
          provider: data.provider,
          name: data.name,
          enabled: data.enabled ?? existing.enabled,
          baseUrl: data.baseUrl,
          apiKey: data.apiKey, // TODO: Encrypt before storing
          vramGb: data.vramGb,
          updatedBy: userId,
        },
      })
    },
  }),
)

// Toggle provider enabled/disabled
builder.mutationField('toggleAiServiceProvider', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiServiceProvider',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
      enabled: t.arg.boolean({ required: true }),
    },
    resolve: async (query, _source, { id, enabled }, context) => {
      const userId = context.session.user.id

      // Verify provider exists and belongs to workspace
      const existing = await prisma.aiServiceProvider.findFirst({
        where: {
          id: String(id),
          workspaceId: context.workspaceId,
        },
      })

      if (!existing) {
        throw new Error('Provider not found or access denied')
      }

      return prisma.aiServiceProvider.update({
        ...query,
        where: { id: String(id) },
        data: {
          enabled,
          updatedBy: userId,
        },
      })
    },
  }),
)

// Delete an AI service provider
builder.mutationField('deleteAiServiceProvider', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_source, { id }, context) => {
      // Verify provider exists and belongs to workspace
      const existing = await prisma.aiServiceProvider.findFirst({
        where: {
          id: String(id),
          workspaceId: context.workspaceId,
        },
      })

      if (!existing) {
        throw new Error('Provider not found or access denied')
      }

      // TODO: Check for dependencies (libraries, assistants using this provider)
      // For now, just delete (cascade will handle relations if any)

      await prisma.aiServiceProvider.delete({
        where: { id: String(id) },
      })

      return true
    },
  }),
)
