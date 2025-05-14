import SchemaBuilder from '@pothos/core'
import PrismaPlugin from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects'

import { Prisma, PrismaClient } from '@george-ai/prismaClient'

import type { GraphQLContext, LoggedInContext } from './context'
import PrismaTypes from '.pothos/plugin-prisma/generated'

const prisma = new PrismaClient({})

const builder = new SchemaBuilder<{
  Context: GraphQLContext
  DefaultInputFieldRequiredness: true
  PrismaTypes: PrismaTypes
  AuthScopes: {
    isLoggedIn: boolean
  }
  AuthContexts: {
    isLoggedIn: LoggedInContext
  }
  Objects: {
    AiLibraryUsageResult: {
      usageId: string | null
      deletedCount: number | null
    }
  }
  Scalars: {
    Date: {
      Input: Date
      Output: Date
    }
    DateTime: {
      Input: Date
      Output: Date
    }
    Decimal: {
      Input: Prisma.Decimal
      Output: Prisma.Decimal
    }
    BigInt: {
      Input: bigint
      Output: bigint
    }
  }
}>({
  defaultInputFieldRequiredness: true,
  plugins: [SimpleObjectsPlugin, PrismaPlugin, ScopeAuthPlugin],
  prisma: {
    client: prisma,
    exposeDescriptions: true,
    filterConnectionTotalCount: true,
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn',
  },
  scopeAuth: {
    authScopes: (context: GraphQLContext) => ({
      isLoggedIn: !!context.user?.id,
    }),
  },
})

builder.queryType()
builder.mutationType()

export { builder, prisma }
