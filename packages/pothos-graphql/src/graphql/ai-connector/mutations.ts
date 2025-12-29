import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@george-ai/app-domain'
import { getConnectorTypeFactory } from '@george-ai/connector-types'

import { builder } from '../builder'

// Input type for connector config (JSON)
const ConnectorConfigInput = builder.inputType('ConnectorConfigInput', {
  fields: (t) => ({
    clientId: t.string({ required: false }),
    clientSecret: t.string({ required: false }),
    // Generic fields for other connector types
    apiKey: t.string({ required: false }),
    token: t.string({ required: false }),
  }),
})

// Input type for creating/updating connectors
const AiConnectorInput = builder.inputType('AiConnectorInput', {
  fields: (t) => ({
    connectorType: t.string({ required: true }),
    baseUrl: t.string({ required: true }),
    name: t.string({ required: false }),
    config: t.field({ type: ConnectorConfigInput, required: true }),
  }),
})

// Enable a connector type for a workspace
builder.mutationField('enableConnectorType', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiConnectorTypeWorkspace',
    nullable: false,
    args: {
      connectorType: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { connectorType }, context) => {
      // Verify connector type exists in registry
      const factory = getConnectorTypeFactory()
      const type = factory.getType(connectorType)
      if (!type) {
        throw new GraphQLError(`Unknown connector type: ${connectorType}`)
      }

      // Create or return existing
      return prisma.aiConnectorTypeWorkspace.upsert({
        ...query,
        where: {
          workspaceId_connectorType: {
            workspaceId: context.workspaceId,
            connectorType,
          },
        },
        create: {
          workspaceId: context.workspaceId,
          connectorType,
        },
        update: {},
      })
    },
  }),
)

// Disable a connector type for a workspace
builder.mutationField('disableConnectorType', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      connectorType: t.arg.string({ required: true }),
    },
    resolve: async (_source, { connectorType }, context) => {
      // Check if any connectors of this type exist
      const connectorsCount = await prisma.aiConnector.count({
        where: {
          workspaceId: context.workspaceId,
          connectorType,
        },
      })

      if (connectorsCount > 0) {
        throw new GraphQLError(
          `Cannot disable connector type "${connectorType}" - ${connectorsCount} connector(s) are using it. Delete them first.`,
        )
      }

      await prisma.aiConnectorTypeWorkspace.deleteMany({
        where: {
          workspaceId: context.workspaceId,
          connectorType,
        },
      })

      return true
    },
  }),
)

// Create a new connector
builder.mutationField('createConnector', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiConnector',
    nullable: false,
    args: {
      data: t.arg({ type: AiConnectorInput, required: true }),
    },
    resolve: async (query, _source, { data }, context) => {
      // Verify connector type is enabled for workspace
      const typeEnabled = await prisma.aiConnectorTypeWorkspace.findUnique({
        where: {
          workspaceId_connectorType: {
            workspaceId: context.workspaceId,
            connectorType: data.connectorType,
          },
        },
      })

      if (!typeEnabled) {
        throw new GraphQLError(`Connector type "${data.connectorType}" is not enabled for this workspace`)
      }

      // Validate and encrypt config via connector type
      const factory = getConnectorTypeFactory()
      const config = factory.prepareConfigForStorage(data.connectorType, data.config as Record<string, unknown>)

      return prisma.aiConnector.create({
        ...query,
        data: {
          workspaceId: context.workspaceId,
          connectorType: data.connectorType,
          baseUrl: data.baseUrl,
          name: data.name,
          config: config as Prisma.InputJsonValue,
        },
      })
    },
  }),
)

// Update a connector
builder.mutationField('updateConnector', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiConnector',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
      data: t.arg({ type: AiConnectorInput, required: true }),
    },
    resolve: async (query, _source, { id, data }, context) => {
      // Verify connector exists and belongs to workspace
      const existing = await prisma.aiConnector.findFirst({
        where: {
          id: String(id),
          workspaceId: context.workspaceId,
        },
      })

      if (!existing) {
        throw new GraphQLError('Connector not found or access denied')
      }

      // Validate and encrypt config via connector type, preserving existing secrets
      const factory = getConnectorTypeFactory()
      const config = factory.prepareConfigForStorage(
        data.connectorType,
        data.config as Record<string, unknown>,
        existing.config as Record<string, unknown>,
      )

      return prisma.aiConnector.update({
        ...query,
        where: { id: String(id) },
        data: {
          connectorType: data.connectorType,
          baseUrl: data.baseUrl,
          name: data.name,
          config: config as Prisma.InputJsonValue,
          isConnected: false, // Reset connection status on update
          lastTestedAt: null,
          lastError: null,
        },
      })
    },
  }),
)

// Delete a connector
builder.mutationField('deleteConnector', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_source, { id }, context) => {
      // Verify connector exists and belongs to workspace
      const existing = await prisma.aiConnector.findFirst({
        where: {
          id: String(id),
          workspaceId: context.workspaceId,
        },
        include: { automations: { select: { id: true } } },
      })

      if (!existing) {
        throw new GraphQLError('Connector not found or access denied')
      }

      if (existing.automations.length > 0) {
        throw new GraphQLError(`Cannot delete connector - ${existing.automations.length} automation(s) are using it`)
      }

      await prisma.aiConnector.delete({
        where: { id: String(id) },
      })

      return true
    },
  }),
)

// Result type for connection test
const TestConnectorConnectionResult = builder.simpleObject('TestConnectorConnectionResult', {
  fields: (t) => ({
    success: t.boolean({ nullable: false }),
    message: t.string({ nullable: false }),
    details: t.string({ nullable: true }),
  }),
})

// Test connector connection
builder.mutationField('testConnectorConnection', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: TestConnectorConnectionResult,
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_source, { id }, context) => {
      // Get connector
      const connector = await prisma.aiConnector.findFirst({
        where: {
          id: String(id),
          workspaceId: context.workspaceId,
        },
      })

      if (!connector) {
        return {
          success: false,
          message: 'Connector not found or access denied',
        }
      }

      const factory = getConnectorTypeFactory()

      try {
        // Test connection (decryption handled internally by factory)
        const result = await factory.testConnection(
          connector.connectorType,
          connector.baseUrl,
          connector.config as Record<string, unknown>,
        )

        // Update connector status
        await prisma.aiConnector.update({
          where: { id: String(id) },
          data: {
            isConnected: result.success,
            lastTestedAt: new Date(),
            lastError: result.error || null,
          },
        })

        return {
          success: result.success,
          message: result.message || (result.success ? 'Connection successful' : 'Connection failed'),
          details: result.error,
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // Update connector status
        await prisma.aiConnector.update({
          where: { id: String(id) },
          data: {
            isConnected: false,
            lastTestedAt: new Date(),
            lastError: errorMessage,
          },
        })

        return {
          success: false,
          message: 'Connection test failed',
          details: errorMessage,
        }
      }
    },
  }),
)
