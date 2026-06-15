import { prisma } from '@george-ai/app-database'

import { DomainError } from '../error'
import { logger } from './common'

export async function createPayment(params: {
  workspaceId?: string
  subscriptionType: string
  validFrom: Date
  validUntil: Date
}): Promise<void> {
  const { subscriptionType, validFrom, validUntil } = params
  let { workspaceId } = params
  logger.debug('Creating payment', params)
  const start = Date.now()

  try {
    if (workspaceId) {
      const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
      if (!workspace) {
        logger.warn('workspaceId not found in DB:', workspaceId)
        workspaceId = undefined
      }
    }
    await prisma.$transaction(async (tx) =>
      tx.payment.create({
        data: {
          workspaceId,
          subscriptionType,
          validFrom,
          validUntil,
        },
      }),
    )
  } catch (error) {
    logger.error('Error creating payment', { error, ...params, elapsed: Date.now() - start })
    throw new DomainError('Failed to create payment. Please try again.', 'payment')
  }
}
