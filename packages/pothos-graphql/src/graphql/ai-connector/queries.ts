import { getConnectorTypeFactory } from '@george-ai/connector-types'

import { prisma } from '../../prisma'
import { builder } from '../builder'

// Simple object for connector type info from the registry
const ConnectorTypeInfo = builder.simpleObject('ConnectorTypeInfo', {
  fields: (t) => ({
    id: t.string({ nullable: false }),
    name: t.string({ nullable: false }),
    description: t.string({ nullable: false }),
    icon: t.string({ nullable: false }),
    authType: t.string({ nullable: false }),
  }),
})

// Query to get all available connector types from the registry
builder.queryField('connectorTypes', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [ConnectorTypeInfo],
    nullable: { list: false, items: false },
    resolve: () => {
      const factory = getConnectorTypeFactory()
      return factory.getAvailableTypes().map((type) => ({
        id: type.id,
        name: type.name,
        description: type.description,
        icon: type.icon,
        authType: type.authType,
      }))
    },
  }),
)

// Query to get connector types enabled for the current workspace
builder.queryField('workspaceConnectorTypes', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiConnectorTypeWorkspace'],
    nullable: { list: false, items: false },
    resolve: (query, _source, _args, context) => {
      return prisma.aiConnectorTypeWorkspace.findMany({
        ...query,
        where: { workspaceId: context.workspaceId },
        orderBy: { connectorType: 'asc' },
      })
    },
  }),
)

// Query to get all connectors for the current workspace
builder.queryField('connectors', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiConnector'],
    nullable: { list: false, items: false },
    args: {
      connectorType: t.arg.string({ required: false }),
    },
    resolve: (query, _source, { connectorType }, context) => {
      return prisma.aiConnector.findMany({
        ...query,
        where: {
          workspaceId: context.workspaceId,
          ...(connectorType ? { connectorType } : {}),
        },
        orderBy: [{ connectorType: 'asc' }, { name: 'asc' }, { baseUrl: 'asc' }],
      })
    },
  }),
)

// Query to get a specific connector by ID
builder.queryField('connector', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiConnector',
    nullable: true,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: (query, _source, { id }, context) => {
      return prisma.aiConnector.findFirst({
        ...query,
        where: {
          id: String(id),
          workspaceId: context.workspaceId,
        },
      })
    },
  }),
)
