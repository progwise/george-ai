import { prisma } from '@george-ai/app-database'

export async function getWorkspacePaymentStatus(workspaceId: string) {
  const payment = await prisma.payment.findFirst({
    where: {
      workspaceId,
      validFrom: { lte: new Date() },
      validUntil: { gt: new Date() },
    },
    orderBy: {
      validUntil: 'desc',
    },
  })

  return {
    isPaid: !!payment,
    subscriptionType: payment?.subscriptionType ?? null,
    validFrom: payment?.validFrom ?? null,
    validUntil: payment?.validUntil ?? null,
  }
}
