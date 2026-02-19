import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'
import { getConnectorTypeFactory } from '@george-ai/connector-types'

import { builder } from '../../builder'
import { automationInputType } from './automation-input'

// Update an automation
builder.mutationField('updateAutomation', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiAutomation',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
      data: t.arg({ type: automationInputType, required: true }),
    },
    resolve: async (query, _source, { id, data }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      // Verify automation exists and belongs to workspace
      const existing = await prisma.aiAutomation.findFirst({
        where: {
          id: String(id),
          workspaceId,
        },
      })

      if (!existing) {
        throw new GraphQLError('Automation not found or access denied')
      }

      // Verify list belongs to workspace
      const list = await prisma.aiList.findFirst({
        where: {
          id: data.listId,
          workspaceId,
        },
      })

      if (!list) {
        throw new GraphQLError('List not found or access denied')
      }

      // Verify connector belongs to workspace
      const connector = await prisma.aiConnector.findFirst({
        where: {
          id: data.connectorId,
          workspaceId,
        },
      })

      if (!connector) {
        throw new GraphQLError('Connector not found or access denied')
      }

      // Get connector type factory
      const factory = getConnectorTypeFactory()

      // Use provided action or keep existing
      const connectorAction = data.connectorAction || existing.connectorAction
      if (!connectorAction) {
        throw new GraphQLError('Connector action is required')
      }

      // Parse and validate action config (uses existing if not provided)
      const parsedActionConfig = data.actionConfig
        ? JSON.parse(data.actionConfig)
        : (existing.connectorActionConfig as Record<string, unknown>)
      const validatedActionConfig = factory.validateActionConfig(
        connector.connectorType,
        connectorAction,
        parsedActionConfig,
      )

      // Parse filter JSON if provided
      const filter = data.filter ? JSON.parse(data.filter) : null

      return prisma.aiAutomation.update({
        ...query,
        where: { id: String(id) },
        data: {
          name: data.name,
          listId: data.listId,
          connectorId: data.connectorId,
          connectorAction,
          connectorActionConfig: validatedActionConfig as Prisma.InputJsonValue,
          filter: filter as Prisma.InputJsonValue,
          schedule: data.schedule,
          executeOnEnrichment: data.executeOnEnrichment ?? false,
        },
      })
    },
  }),
)
