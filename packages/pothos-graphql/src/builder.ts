import SchemaBuilder from '@pothos/core'
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects'
import { Prisma, PrismaClient } from '@george-ai/prismaClient'
import PrismaPlugin from '@pothos/plugin-prisma'
import PrismaTypes from '.pothos/plugin-prisma/generated'
const prisma = new PrismaClient({})

const builder = new SchemaBuilder<{
  DefaultInputFieldRequiredness: true
  PrismaTypes: PrismaTypes
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
