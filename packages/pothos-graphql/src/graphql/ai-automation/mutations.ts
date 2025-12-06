import { GraphQLError } from 'graphql'

import { getConnectorTypeFactory } from '@george-ai/connector-types'

import { Prisma } from '../../../prisma/generated/client'
import { syncAutomationItems } from '../../domain/automation'
import { prisma } from '../../prisma'
import { builder } from '../builder'

// Input type for creating/updating automations
const AiAutomationInput = builder.inputType('AiAutomationInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    listId: t.string({ required: true }),
    connectorId: t.string({ required: true }),
    connectorAction: t.string({ required: false }), // Optional - uses first action if not provided
    actionConfig: t.string({ required: false }), // JSON string - uses default if not provided
    filter: t.string({ required: false }), // JSON string for filter criteria
    schedule: t.string({ required: false }), // CRON expression
    executeOnEnrichment: t.boolean({ required: false }),
  }),
})

// Create a new automation
builder.mutationField('createAutomation', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiAutomation',
    nullable: false,
    args: {
      data: t.arg({ type: AiAutomationInput, required: true }),
    },
    resolve: async (query, _source, { data }, context) => {
      // Verify list belongs to workspace
      const list = await prisma.aiList.findFirst({
        where: {
          id: data.listId,
          workspaceId: context.workspaceId,
        },
      })

      if (!list) {
        throw new GraphQLError('List not found or access denied')
      }

      // Verify connector belongs to workspace
      const connector = await prisma.aiConnector.findFirst({
        where: {
          id: data.connectorId,
          workspaceId: context.workspaceId,
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
          workspaceId: context.workspaceId,
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
      await syncAutomationItems(automation.id)

      return automation
    },
  }),
)

// Update an automation
builder.mutationField('updateAutomation', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiAutomation',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
      data: t.arg({ type: AiAutomationInput, required: true }),
    },
    resolve: async (query, _source, { id, data }, context) => {
      // Verify automation exists and belongs to workspace
      const existing = await prisma.aiAutomation.findFirst({
        where: {
          id: String(id),
          workspaceId: context.workspaceId,
        },
      })

      if (!existing) {
        throw new GraphQLError('Automation not found or access denied')
      }

      // Verify list belongs to workspace
      const list = await prisma.aiList.findFirst({
        where: {
          id: data.listId,
          workspaceId: context.workspaceId,
        },
      })

      if (!list) {
        throw new GraphQLError('List not found or access denied')
      }

      // Verify connector belongs to workspace
      const connector = await prisma.aiConnector.findFirst({
        where: {
          id: data.connectorId,
          workspaceId: context.workspaceId,
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

// Delete an automation
builder.mutationField('deleteAutomation', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_source, { id }, context) => {
      // Verify automation exists and belongs to workspace
      const existing = await prisma.aiAutomation.findFirst({
        where: {
          id: String(id),
          workspaceId: context.workspaceId,
        },
      })

      if (!existing) {
        throw new GraphQLError('Automation not found or access denied')
      }

      await prisma.aiAutomation.delete({
        where: { id: String(id) },
      })

      return true
    },
  }),
)

// Result type for trigger operations
const TriggerResult = builder.simpleObject('TriggerResult', {
  fields: (t) => ({
    success: t.boolean({ nullable: false }),
    message: t.string({ nullable: false }),
    batchId: t.string({ nullable: true }),
  }),
})

// Trigger an automation (run all in-scope items)
builder.mutationField('triggerAutomation', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: TriggerResult,
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_source, { id }, context) => {
      // Verify automation exists and belongs to workspace
      const automation = await prisma.aiAutomation.findFirst({
        where: {
          id: String(id),
          workspaceId: context.workspaceId,
        },
        include: {
          items: {
            where: { inScope: true },
          },
        },
      })

      if (!automation) {
        return {
          success: false,
          message: 'Automation not found or access denied',
        }
      }

      if (automation.items.length === 0) {
        return {
          success: false,
          message: 'No items in scope for this automation',
        }
      }

      // Create a batch for this trigger
      const batch = await prisma.aiAutomationBatch.create({
        data: {
          automationId: String(id),
          status: 'PENDING',
          triggeredBy: 'MANUAL',
          itemsTotal: automation.items.length,
        },
      })

      // Mark all in-scope items as PENDING for this batch
      await prisma.aiAutomationItem.updateMany({
        where: {
          automationId: String(id),
          inScope: true,
        },
        data: {
          status: 'PENDING',
        },
      })

      return {
        success: true,
        message: `Triggered automation for ${automation.items.length} items`,
        batchId: batch.id,
      }
    },
  }),
)

// Trigger a single automation item
builder.mutationField('triggerAutomationItem', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: TriggerResult,
    nullable: false,
    args: {
      automationItemId: t.arg.id({ required: true }),
    },
    resolve: async (_source, { automationItemId }, context) => {
      // Verify automation item exists and belongs to workspace
      const item = await prisma.aiAutomationItem.findFirst({
        where: {
          id: String(automationItemId),
          automation: {
            workspaceId: context.workspaceId,
          },
        },
        include: {
          automation: true,
        },
      })

      if (!item) {
        return {
          success: false,
          message: 'Automation item not found or access denied',
        }
      }

      // Create a batch for this single item trigger
      const batch = await prisma.aiAutomationBatch.create({
        data: {
          automationId: item.automationId,
          status: 'PENDING',
          triggeredBy: 'MANUAL',
          itemsTotal: 1,
        },
      })

      // Mark item as PENDING
      await prisma.aiAutomationItem.update({
        where: { id: String(automationItemId) },
        data: { status: 'PENDING' },
      })

      return {
        success: true,
        message: 'Triggered single item execution',
        batchId: batch.id,
      }
    },
  }),
)
