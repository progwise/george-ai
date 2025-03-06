import SchemaBuilder from '@pothos/core'
import PrismaPlugin from '@pothos/plugin-prisma'
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects'

import { Prisma, PrismaClient } from '@george-ai/prismaClient'

import PrismaTypes from '.pothos/plugin-prisma/generated'

const prisma = new PrismaClient({})

const builder = new SchemaBuilder<{
  DefaultInputFieldRequiredness: true
  PrismaTypes: PrismaTypes
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
  plugins: [SimpleObjectsPlugin, PrismaPlugin],
  prisma: {
    client: prisma,
    exposeDescriptions: true,
    filterConnectionTotalCount: true,
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn',
  },
})

builder.queryType()
builder.mutationType()

export { builder, prisma }
