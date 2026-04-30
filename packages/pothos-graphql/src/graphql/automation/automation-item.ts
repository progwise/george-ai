import { prisma } from '@george-ai/app-database'
import { list as lst } from '@george-ai/app-domain'
import { TransformType, rawActionConfigSchema, transformValue } from '@george-ai/connector-types'

import { builder } from '../builder'

builder.prismaObject('AiAutomationItem', {
  name: 'AutomationItem',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    automationId: t.exposeString('automationId', { nullable: false }),
    listItemId: t.exposeString('listItemId', { nullable: false }),
    inScope: t.exposeBoolean('inScope', { nullable: false }),
    // Derive status from latest execution to ensure consistency
    status: t.field({
      type: 'AutomationItemStatus',
      nullable: false,
      resolve: async (item) => {
        // Get the latest execution for this item
        const lastExecution = await prisma.aiAutomationItemExecution.findFirst({
          where: { automationItemId: item.id },
          orderBy: { startedAt: 'desc' },
          select: { status: true },
        })
        // If there's an execution, use its status; otherwise use the stored status
        return lastExecution?.status ?? item.status
      },
    }),
    automation: t.relation('automation', { nullable: false }),
    listItem: t.relation('listItem', { nullable: false }),
    executions: t.relation('executions', { nullable: false, query: { orderBy: { startedAt: 'desc' } } }),
    lastExecutedAt: t.field({
      type: 'DateTime',
      nullable: true,
      resolve: async (item) => {
        const lastExecution = await prisma.aiAutomationItemExecution.findFirst({
          where: { automationItemId: item.id, finishedAt: { not: null } },
          orderBy: { finishedAt: 'desc' },
          select: { finishedAt: true },
        })
        return lastExecution?.finishedAt ?? null
      },
    }),
    preview: t.field({
      type: ['AutomationPreviewValue'],
      nullable: { list: false, items: false },
      resolve: async (item) => {
        // Get automation with config
        const automation = await prisma.aiAutomation.findUnique({
          where: { id: item.automationId },
          select: { connectorActionConfig: true, listId: true },
        })
        if (!automation) return []

        const config = rawActionConfigSchema.safeParse(automation.connectorActionConfig)
        if (!config.success || config.data.fieldMappings.length === 0) return []

        // Get list item with field values (matching ListItemWithRelations type)
        const listItem = await prisma.aiListItem.findUnique({
          where: { id: item.listItemId },
          include: {
            cache: true,
            file: {
              include: {
                crawledByCrawler: { select: { uri: true } },
                library: { select: { name: true } },
              },
            },
          },
        })
        if (!listItem) return []

        // Get field definitions for the mapped source fields
        const sourceFieldIds = config.data.fieldMappings.map((m) => m.sourceFieldId)
        const fields = await prisma.aiListField.findMany({
          where: { id: { in: sourceFieldIds } },
          select: { id: true, name: true, type: true, sourceType: true, fileProperty: true },
        })

        // Build preview values
        return config.data.fieldMappings.map((mapping) => {
          const field = fields.find((f) => f.id === mapping.sourceFieldId)
          if (!field) {
            return { targetField: mapping.targetField, value: null, transformedValue: null, isMissing: true }
          }

          const { value } = lst.getFieldValue(listItem, field)
          // A value of '-' from getFieldValue means no cache record exists
          // null or empty string also means missing
          const isMissing = value === null || value === '-' || value === ''
          // Truncate long values for table preview
          const truncatedValue = value && value !== '-' && value.length > 100 ? `${value.slice(0, 100)}...` : value
          // Apply transform for drawer preview
          const transformed = transformValue(value, mapping.transform as TransformType)
          const transformedValue = transformed != null ? String(transformed) : null

          return {
            targetField: mapping.targetField,
            value: isMissing ? null : truncatedValue,
            transformedValue: isMissing ? null : transformedValue,
            isMissing,
          }
        })
      },
    }),
    hasIncompleteData: t.field({
      type: 'Boolean',
      nullable: false,
      description: 'True if any mapped field is missing a value',
      resolve: async (item) => {
        // Get automation with config
        const automation = await prisma.aiAutomation.findUnique({
          where: { id: item.automationId },
          select: { connectorActionConfig: true },
        })
        if (!automation) return false

        const config = rawActionConfigSchema.safeParse(automation.connectorActionConfig)
        if (!config.success || config.data.fieldMappings.length === 0) return false

        // Get list item with cache
        const listItem = await prisma.aiListItem.findUnique({
          where: { id: item.listItemId },
          include: {
            cache: true,
            file: {
              include: {
                crawledByCrawler: { select: { uri: true } },
                library: { select: { name: true } },
              },
            },
          },
        })
        if (!listItem) return true // Item doesn't exist, consider incomplete

        // Get field definitions
        const sourceFieldIds = config.data.fieldMappings.map((m) => m.sourceFieldId)
        const fields = await prisma.aiListField.findMany({
          where: { id: { in: sourceFieldIds } },
          select: { id: true, name: true, type: true, sourceType: true, fileProperty: true },
        })

        // Check if any mapped field is missing a value
        for (const mapping of config.data.fieldMappings) {
          const field = fields.find((f) => f.id === mapping.sourceFieldId)
          if (!field) return true // Field definition not found

          const { value } = lst.getFieldValue(listItem, field)
          if (value === null || value === '-' || value === '') {
            return true // Missing value
          }
        }

        return false
      },
    }),
  }),
})
