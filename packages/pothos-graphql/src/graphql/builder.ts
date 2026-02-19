import SchemaBuilder from '@pothos/core'
import PrismaPlugin from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects'

import { type PothosTypes, Prisma, getDatamodel, prisma } from '@george-ai/app-database'
import { Context, LoggedInContext, getConfig } from '@george-ai/app-domain'

import { GeorgeEnumTypes, GeorgeInputTypes, GeorgeInterfaceTypes, GeorgeObjectTypes } from './common'

const builder = new SchemaBuilder<{
  DefaultInputFieldRequiredness: true
  PrismaTypes: PothosTypes
  Context: Context
  AuthScopes: {
    isLoggedIn: boolean
  }
  AuthContexts: {
    isLoggedIn: LoggedInContext
  }
  Objects: GeorgeObjectTypes & GeorgeEnumTypes
  Interfaces: GeorgeInterfaceTypes
  Inputs: GeorgeInputTypes & GeorgeEnumTypes
  Scalars: {
    Date: {
      Input: Date
      Output: string | Date
    }
    DateTime: {
      Input: Date
      Output: string | Date
    }
    Decimal: {
      Input: Prisma.Decimal
      Output: Prisma.Decimal
    }
    BigInt: {
      Input: bigint
      Output: bigint
    }
    SortOrder: {
      Input: 'asc' | 'desc'
      Output: 'asc' | 'desc'
    }
  }
}>({
  defaultInputFieldRequiredness: true,
  plugins: [ScopeAuthPlugin, SimpleObjectsPlugin, PrismaPlugin],
  prisma: {
    client: prisma,
    dmmf: getDatamodel(),
    exposeDescriptions: true,
    filterConnectionTotalCount: true,
    onUnusedQuery: getConfig('IS_PRODUCTION') ? null : 'warn',
  },
  scopeAuth: {
    authScopes: async (context) => {
      return {
        isLoggedIn: !!context.session,
      }
    },
    unauthorizedError: () => {
      throw Error('Unauthorized')
    },
  },
})

builder.queryType()
builder.mutationType()

export { builder }
