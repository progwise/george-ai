import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@george-ai/app-database'
import { automation as auto, canWriteWorkspaceOrThrow } from '@george-ai/app-domain'
import { getConnectorTypeFactory } from '@george-ai/connector-types'

import { builder } from '../../builder'
import { automationInputType } from './automation-input'

// Create a new automation
builder.mutationField('createAutomation', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiAutomation',
    nullable: false,
    args: {
      data: t.arg({ type: automationInputType, required: true }),
    },
    resolve: async (query, _source, { data }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
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

      // Use provided action or default to first action
      const connectorAction = data.connectorAction || factory.getDefaultActionId(connector.connectorType)
      if (!connectorAction) {
        throw new GraphQLError(`No actions available for connector type ${connector.connectorType}`)
      }

      // Parse and validate action config (uses default if not provided)
      const parsedActionConfig = data.actionConfig ? JSON.parse(data.actionConfig) : null
      const validatedActionConfig = factory.validateActionConfig(
        connector.connectorType,
        connectorAction,
        parsedActionConfig,
      )

      // Parse filter JSON if provided
      const filter = data.filter ? JSON.parse(data.filter) : null

      // Create the automation
      const automation = await prisma.aiAutomation.create({
        ...query,
        data: {
          workspaceId,
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

      // Sync automation items from the linked list
      await auto.syncItems(automation.id)

      return automation
    },
  }),
)
