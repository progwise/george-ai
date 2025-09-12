import SchemaBuilder from '@pothos/core'
import PrismaPlugin from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects'

import { Prisma, PrismaClient } from '@george-ai/prismaClient'

import { EMBEDDING_STATUS, EXTRACTION_STATUS, PROCESSING_STATUS } from '../domain/content-extraction/task-status'
import { Context, LoggedInContext } from './context'
import PrismaTypes from '.pothos/plugin-prisma/generated'

const prisma = new PrismaClient({})

const builder = new SchemaBuilder<{
  DefaultInputFieldRequiredness: true
  PrismaTypes: PrismaTypes
  Context: Context
  AuthScopes: {
    isLoggedIn: boolean
  }
  AuthContexts: {
    isLoggedIn: LoggedInContext
  }
  Scalars: {
    ProcessingStatus: {
      Input: (typeof PROCESSING_STATUS)[number]
      Output: (typeof PROCESSING_STATUS)[number]
    }
    ExtractionStatus: {
      Input: (typeof EXTRACTION_STATUS)[number]
      Output: (typeof EXTRACTION_STATUS)[number]
    }
    EmbeddingStatus: {
      Input: (typeof EMBEDDING_STATUS)[number]
      Output: (typeof EMBEDDING_STATUS)[number]
    }
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
    }),
    unauthorizedError: () => {
      throw Error('Unauthorized')
    },
  },
})

builder.queryType()
builder.mutationType()

export { builder, prisma }
