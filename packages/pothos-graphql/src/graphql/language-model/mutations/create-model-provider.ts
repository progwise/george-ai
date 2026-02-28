import { GraphQLError } from 'graphql'

import { encryptValue } from '@george-ai/app-commons'
import { prisma } from '@george-ai/app-database'
import { canAdminWorkspaceOrThrow, invalidateWorkspace } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Create a new AI service provider
// TODO: Do we need to publish the new provider via event service?
builder.mutationField('createModelProvider', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiServiceProvider',
    nullable: false,
    args: {
      data: t.arg({ type: 'ModelProviderInput', required: true }),
    },
    resolve: async (query, _source, { data }, { workspaceId, session }) => {
      const userId = session.user.id
      await canAdminWorkspaceOrThrow(workspaceId, userId)

      // Check for duplicate name within same provider type
      const existing = await prisma.aiServiceProvider.count({
        where: {
          workspaceId,
          provider: data.provider,
          name: data.name,
        },
      })

      if (existing > 0) {
        throw new GraphQLError(`Provider '${data.provider}' with name '${data.name}' already exists in this workspace`)
      }

      // For non-Ollama providers, if enabling this provider, disable others of same type
      const shouldEnable = data.enabled ?? true
      if (shouldEnable && data.provider !== 'ollama') {
        await prisma.aiServiceProvider.updateMany({
          where: {
            workspaceId,
            provider: data.provider,
            enabled: true,
          },
          data: {
            enabled: false,
          },
        })
      }
      const encryptedApi = encryptValue(data.apiKey)

      const provider = await prisma.aiServiceProvider.create({
        ...query,
        data: {
          workspaceId,
          provider: data.provider,
          name: data.name,
          enabled: shouldEnable,
          baseUrl: data.baseUrl,
          apiKey: encryptedApi,
          vramGb: data.vramGb,
          createdBy: userId,
        },
      })

      invalidateWorkspace(workspaceId)

      return provider
    },
  }),
)
