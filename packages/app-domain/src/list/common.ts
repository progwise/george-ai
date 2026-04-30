import { prisma } from '@george-ai/app-database'

export type PrismaClient = typeof prisma
export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>
