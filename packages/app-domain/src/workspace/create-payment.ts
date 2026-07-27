import { prisma } from '@george-ai/app-database'

import { DomainError } from '../error'
import { logger } from './common'

export async function createPayment(params: {
  paymentProvider: string
  invoiceId: string
  workspaceId?: string
  subscriptionType: string
  validFrom: Date
  validUntil: Date
}): Promise<void> {
  const { paymentProvider, invoiceId, subscriptionType, validFrom, validUntil } = params
  let { workspaceId } = params
  logger.debug('Creating payment', params)
  const start = Date.now()

  try {
    await prisma.$transaction(async (tx) => {
      if (workspaceId) {
        const workspace = await tx.workspace.findUnique({ where: { id: workspaceId } })
        if (!workspace) {
          logger.warn('workspaceId not found in DB:', workspaceId)
          workspaceId = undefined
        }
      }
      await tx.payment.upsert({
        where: { paymentProvider_invoiceId: { paymentProvider, invoiceId } },
        create: { paymentProvider, invoiceId, workspaceId, subscriptionType, validFrom, validUntil },
        update: {},
      })
    })
  } catch (error) {
    logger.error('Error creating payment', { error, ...params, elapsed: Date.now() - start })
    throw new DomainError('Failed to create payment. Please try again.', 'payment')
  }
}
