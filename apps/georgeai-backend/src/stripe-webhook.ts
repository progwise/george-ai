import { Request, Response } from 'express'
import Stripe from 'stripe'

import { getConfigValue } from '@george-ai/app-commons'
import { createPayment } from '@george-ai/app-domain'

import { logger } from './common'

const STRIPE_SECRET_KEY = getConfigValue('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK_SECRET = getConfigValue('STRIPE_WEBHOOK_SECRET')

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : undefined

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature']

  if (!sig) {
    res.status(400).send('No signature')
    return
  }

  if (!stripe) {
    logger.error('[stripe-webhook] Stripe is not configured')
    res.status(400).send('Stripe is not configured')
    return
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    logger.error('[stripe-webhook] Stripe webhook secret is not configured')
    res.status(400).send('Stripe webhook secret is not configured')
    return
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    logger.error('[stripe-webhook] Signature verification failed:', err)
    res.status(400).send('Webhook signature invalid')
    return
  }

  if (event.type === 'invoice.paid') {
    try {
      const invoice = event.data.object as Stripe.Invoice
      const subscription = invoice.parent?.subscription_details
      const subscriptionId = subscription?.subscription as string
      const line = invoice.lines.data[0]

      if (!subscriptionId) {
        logger.warn('[stripe-webhook] No subscription in invoice, skipping:', invoice.id)
        res.send('ok')
        return
      }

      if (!line) {
        logger.warn('[stripe-webhook] invoice.paid has no line items, skipping:', invoice.id)
        res.send('ok')
        return
      }

      const workspaceId = subscription?.metadata?.workspaceId || undefined
      const subscriptionType = subscription?.metadata?.subscriptionType

      if (!subscriptionType) {
        logger.warn('[stripe-webhook] invoice.paid has no subscriptionType in metadata, skipping:', invoice.id)
        res.send('ok')
        return
      }

      await createPayment({
        paymentProvider: 'stripe',
        invoiceId: invoice.id,
        workspaceId,
        subscriptionType,
        validFrom: new Date(line.period.start * 1000),
        validUntil: new Date(line.period.end * 1000),
      })
    } catch (err) {
      // res 500 lets stripe retry
      logger.error('[stripe-webhook] Failed processing payment to database', err)
      res.status(500).send('Internal processing failed')
      return
    }
  }
  res.send('ok')
}
