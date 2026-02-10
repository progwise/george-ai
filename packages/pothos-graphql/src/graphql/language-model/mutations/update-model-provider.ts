import { GraphQLError } from 'graphql'

import { invalidateWorkspace } from '@george-ai/ai-service-client'
import { encryptValue } from '@george-ai/app-commons'
import { prisma } from '@george-ai/app-database'
import { canAdminWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Update an existing AI service provider
builder.mutationField('updateModelProvider', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiServiceProvider',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
      data: t.arg({ type: 'ModelProviderInput', required: true }),
    },
    resolve: async (query, _source, { id, data }, { workspaceId, session }) => {
      const userId = session.user.id
      await canAdminWorkspaceOrThrow(workspaceId, userId)

      // Verify provider exists and belongs to workspace
      const existing = await prisma.aiServiceProvider.findFirst({
        where: {
          id: String(id),
          workspaceId,
        },
      })

      if (!existing) {
        throw new GraphQLError('Provider not found or access denied')
      }

      // Check for duplicate name if provider/name changed
      if (data.provider !== existing.provider || data.name !== existing.name) {
        const duplicate = await prisma.aiServiceProvider.findFirst({
          where: {
            workspaceId,
            provider: data.provider,
            name: data.name,
            id: { not: String(id) },
          },
        })

        if (duplicate) {
          throw new GraphQLError(
            `Provider '${data.provider}' with name '${data.name}' already exists in this workspace`,
          )
        }
      }

      // For non-Ollama providers, if enabling this provider, disable others of same type
      const shouldEnable = data.enabled ?? existing.enabled
      if (shouldEnable && data.provider !== 'ollama') {
        await prisma.aiServiceProvider.updateMany({
          where: {
            workspaceId,
            provider: data.provider,
            enabled: true,
            id: { not: String(id) },
          },
          data: {
            enabled: false,
          },
        })
      }

      const provider = await prisma.aiServiceProvider.update({
        ...query,
        where: { id: String(id) },
        data: {
          provider: data.provider,
          name: data.name,
          enabled: shouldEnable,
          baseUrl: data.baseUrl,
          // Only update apiKey if provided (preserve existing if undefined)
          ...(data.apiKey && { apiKey: encryptValue(data.apiKey) }),
          vramGb: data.vramGb,
          updatedBy: userId,
        },
      })

      // Invalidate provider cache for this workspace
      invalidateWorkspace(workspaceId)

      return provider
    },
  }),
)
