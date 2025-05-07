import { PrismaClient } from '@george-ai/prismaClient'

const prisma = new PrismaClient()

export default async () => {
  await prisma.$transaction([
    prisma.aiLibraryCrawler.deleteMany(),
    prisma.aiLibrary.deleteMany(),
    prisma.user.deleteMany(),
  ])
}
