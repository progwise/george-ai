import { Request, Response } from 'express'
import Stripe from 'stripe'

import { createPayment } from '@george-ai/app-domain'

import { logger } from './common'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature']

  if (!sig) {
    res.status(400).send('No signature')
    return
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    logger.error('[stripe-webhook] Signature verification failed:', err)
    res.status(400).send('Webhook signature invalid')
    return
  }

  if (event.type === 'checkout.session.completed') {
    try {
      const session = event.data.object as Stripe.Checkout.Session
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      const workspaceId = session.metadata?.workspaceId || undefined
      const subscriptionType = session.metadata?.subscriptionType
      const item = subscription.items.data[0]

      await createPayment({
        workspaceId,
        subscriptionType: subscriptionType ?? 'subscriptionTypeMissing',
        validFrom: new Date(item.current_period_start * 1000),
        validUntil: new Date(item.current_period_end * 1000),
      })
    } catch (err) {
      // res 500 lets stripe retry
      logger.error('[stripe-webhook] Failed processing payment to database', err)
      res.status(500).send('Internal processing failed')
      return
    }

    res.send('ok')
  }
}
