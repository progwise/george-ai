import SchemaBuilder from '@pothos/core'
import PrismaPlugin from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects'
import { Decimal } from '@prisma/client/runtime/library'

import { EMBEDDING_STATUS, EXTRACTION_STATUS, PROCESSING_STATUS } from '../domain/content-extraction/task-status'
import { LIST_FIELD_FILE_PROPERTIES, LIST_FIELD_SOURCE_TYPES, LIST_FIELD_TYPES } from '../domain/list'
import { prisma } from '../prisma'
import { Context, LoggedInContext } from './context'
import PrismaTypes from '.pothos/plugin-prisma/generated'

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
    ListFieldSourceType: {
      Input: (typeof LIST_FIELD_SOURCE_TYPES)[number]
      Output: (typeof LIST_FIELD_SOURCE_TYPES)[number]
    }
    ListFieldType: {
      Input: (typeof LIST_FIELD_TYPES)[number]
      Output: (typeof LIST_FIELD_TYPES)[number]
    }
    ListFieldFileProperty: {
      Input: (typeof LIST_FIELD_FILE_PROPERTIES)[number]
      Output: (typeof LIST_FIELD_FILE_PROPERTIES)[number]
    }
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
      Input: Decimal
      Output: Decimal
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
