import { prisma } from '@george-ai/app-domain'
import { getConnectorTypeFactory } from '@george-ai/connector-types'

import { builder } from '../builder'

// Simple object for config field options (target fields, transforms, etc.)
const ActionConfigOption = builder.simpleObject('ActionConfigOption', {
  fields: (t) => ({
    id: t.string({ nullable: false }),
    name: t.string({ nullable: false }),
    description: t.string({ nullable: true }),
  }),
})

// Simple object for action config field definition
const ActionConfigField = builder.simpleObject('ActionConfigField', {
  fields: (t) => ({
    id: t.string({ nullable: false }),
    name: t.string({ nullable: false }),
    description: t.string({ nullable: true }),
    type: t.string({ nullable: false }),
    required: t.boolean({ nullable: false }),
    options: t.field({
      type: [ActionConfigOption],
      nullable: { list: true, items: false },
    }),
    targetFields: t.field({
      type: [ActionConfigOption],
      nullable: { list: true, items: false },
    }),
    transforms: t.field({
      type: [ActionConfigOption],
      nullable: { list: true, items: false },
    }),
  }),
})

// Simple object for connector action info
const ConnectorActionInfo = builder.simpleObject('ConnectorActionInfo', {
  fields: (t) => ({
    id: t.string({ nullable: false }),
    name: t.string({ nullable: false }),
    description: t.string({ nullable: false }),
    configFields: t.field({
      type: [ActionConfigField],
      nullable: { list: false, items: false },
    }),
  }),
})

// Simple object for connector type info from the registry
const ConnectorTypeInfo = builder.simpleObject('ConnectorTypeInfo', {
  fields: (t) => ({
    id: t.string({ nullable: false }),
    name: t.string({ nullable: false }),
    description: t.string({ nullable: false }),
    icon: t.string({ nullable: false }),
    authType: t.string({ nullable: false }),
    actions: t.field({
      type: [ConnectorActionInfo],
      nullable: { list: false, items: false },
    }),
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
        actions: type.actions.map((action) => ({
          id: action.id,
          name: action.name,
          description: action.description,
          configFields: action.configFields.map((field) => ({
            id: field.id,
            name: field.name,
            description: field.description || null,
            type: field.type,
            required: field.required ?? false,
            options: field.options || null,
            targetFields: field.targetFields || null,
            transforms: field.transforms || null,
          })),
        })),
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
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: (query, _source, { id }, context) => {
      return prisma.aiConnector.findFirstOrThrow({
        ...query,
        where: {
          id: String(id),
          workspaceId: context.workspaceId,
        },
      })
    },
  }),
)
