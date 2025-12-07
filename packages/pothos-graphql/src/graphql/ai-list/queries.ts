import { z } from 'zod'

import { FieldType, LIST_FIELD_FILE_PROPERTIES, LIST_FIELD_SOURCE_TYPES } from '../../domain/list'
import { prisma } from '../../prisma'
import { builder } from '../builder'
import { AiListFilterInput, AiListSortingInput, ListItemsQueryResult } from './field-values'

console.log('Setting up: AiList queries')

builder.queryField('aiLists', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiList'],
    nullable: false,
    resolve: async (query, _source, _args, context) => {
      const workspaceId = context.workspaceId
      // Any workspace member can access all lists in the workspace
      return prisma.aiList.findMany({
        ...query,
        where: {
          workspaceId,
        },
        orderBy: { name: 'asc' },
      })
    },
  }),
)

builder.queryField('aiList', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiList',
    nullable: false,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { id }, context) => {
      // Any workspace member can access lists in their workspace
      const list = await prisma.aiList.findUniqueOrThrow({
        ...query,
        where: { id, workspaceId: context.workspaceId },
      })
      return list
    },
  }),
)

builder.queryField('aiListItem', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiListItem',
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { id }, context) => {
      // Any workspace member can access items in lists in their workspace
      const item = await prisma.aiListItem.findUnique({
        ...query,
        where: { id },
      })
      if (!item) return null

      // Verify the item belongs to a list in the user's workspace
      const list = await prisma.aiList.findFirst({
        where: { id: item.listId, workspaceId: context.workspaceId },
      })
      if (!list) return null

      return item
    },
  }),
)

builder.queryField('aiListItems', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ListItemsQueryResult,
    nullable: false,
    args: {
      listId: t.arg.string({ required: true }),
      fieldIds: t.arg.stringList({ required: true }),
      skip: t.arg.int({ required: true, defaultValue: 0 }),
      take: t.arg.int({ required: true, defaultValue: 20 }),
      sorting: t.arg({ type: [AiListSortingInput!], required: false }),
      filters: t.arg({ type: [AiListFilterInput!], required: false }),
      selectedItemId: t.arg.string({ required: false }),
      showArchived: t.arg.boolean({ required: false, defaultValue: false }),
    },
    resolve: async (_root, args, context) => {
      // Any workspace member can access lists in their workspace
      const list = await prisma.aiList.findUniqueOrThrow({
        where: { id: args.listId, workspaceId: context.workspaceId },
        include: { sources: true },
      })
      const fields = await prisma.aiListField.findMany({
        select: {
          id: true,
          listId: true,
          name: true,
          sourceType: true,
          fileProperty: true,
          type: true,
        },

        where: { id: { in: args.fieldIds }, listId: args.listId },
        orderBy: { order: 'asc' },
      })

      return {
        list: list,
        fields: fields.map((field) => ({
          id: field.id,
          listId: field.listId,
          name: field.name,
          sourceType: z.enum(LIST_FIELD_SOURCE_TYPES).parse(field.sourceType),
          fileProperty: z.enum(LIST_FIELD_FILE_PROPERTIES).nullable().parse(field.fileProperty),
          type: field.type as FieldType,
        })),
        skip: args.skip ?? 0,
        take: args.take ?? 20,
        sorting: args.sorting ?? [],
        filters: args.filters ?? [],
        selectedItemId: args.selectedItemId ?? undefined,
        showArchived: args.showArchived ?? false,
      }
    },
  }),
)
