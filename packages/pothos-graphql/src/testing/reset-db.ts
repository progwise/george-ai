import { prisma } from '@george-ai/app-domain'

export default async () => {
  await prisma.$transaction([
    prisma.aiLibraryCrawler.deleteMany(),
    prisma.aiLibrary.deleteMany(),
    prisma.user.deleteMany(),
  ])
}
