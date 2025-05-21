import SchemaBuilder from '@pothos/core'
import PrismaPlugin from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects'

import { Prisma, PrismaClient } from '@george-ai/prismaClient'

import { Context, LoggedInContext } from './context'
import PrismaTypes from '.pothos/plugin-prisma/generated'

const prisma = new PrismaClient({})

const builder = new SchemaBuilder<{
  DefaultInputFieldRequiredness: true
  PrismaTypes: PrismaTypes
  Context: Context
  AuthScopes: {
    isLoggedIn: boolean
    hasUserId: string
  }
  AuthContexts: {
    isLoggedIn: LoggedInContext
    hasUserId: LoggedInContext
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
  plugins: [ScopeAuthPlugin, SimpleObjectsPlugin, PrismaPlugin],
  prisma: {
    client: prisma,
    exposeDescriptions: true,
    filterConnectionTotalCount: true,
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn',
  },
  scopeAuth: {
    authScopes: async (context) => ({
      isLoggedIn: !!context.session,
      hasUserId: (userId: string) => context.session?.user.id === userId,
    }),
    unauthorizedError: () => {
      throw Error('Unauthorized')
    },
  },
})

builder.queryType()
builder.mutationType()

export { builder, prisma }
