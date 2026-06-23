import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import Stripe from 'stripe'

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY)

export const checkout = defineAction({
  accept: 'json',
  input: z.object({
    priceId: z.string(),
    quantity: z.number().int().positive().default(1),
    workspaceId: z.string(),
    subscriptionType: z.string(),
  }),
  handler: async (input) => {
    const { priceId, quantity, workspaceId, subscriptionType } = input

    const url = import.meta.env.DOMAIN || process.env.DOMAIN || 'http://localhost:4321'

    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: priceId, quantity }],
        mode: 'subscription',
        success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url}/cancel?session_id={CHECKOUT_SESSION_ID}`,
        subscription_data: {
          metadata: { workspaceId, subscriptionType },
        },
        expand: ['subscription'],
      })

      if (!session.url) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Stripe did not return a checkout URL.',
        })
      }

      return { url: session.url }
    } catch (error) {
      if (error instanceof ActionError) throw error

      console.error('Stripe checkout error:', error)
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create checkout session. Please try again later.',
      })
    }
  },
})
