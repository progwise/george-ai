import { expect, test } from '@playwright/test'
import { Client } from 'pg'
import Stripe from 'stripe'

import { loginToWebapp } from './webapp-utils/login-util'
import { closeMigrationDialogIfPresent } from './webapp-utils/migration-dialog-util'
import { switchWorkspace } from './webapp-utils/workspace-switcher-util'

const MARKETING_WEBSITE_URL = process.env.MARKETING_WEBSITE_URL || 'http://localhost:4321'
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3003'

test.describe('Payment', () => {
  test.beforeEach(async ({ page }) => {
    await loginToWebapp(page)
    await page.waitForLoadState('networkidle')
    await closeMigrationDialogIfPresent(page)
  })

  test.describe.serial('full payment flow', () => {
    test('visit pricing from workspace and complete checkout', async ({ page }) => {
      await page.waitForLoadState('networkidle')
      await switchWorkspace(page, 'E2E Test Workspace 1')

      // navigate to upgrade workspace dialog
      const sidebar = page.getByRole('complementary', { name: /main menu/i })
      await sidebar.getByLabel('Open sidebar').click({ force: true })

      // head to pricing options
      const upgradeWorkspaceButton = sidebar.getByRole('button', { name: /upgrade workspace/i })
      await expect(upgradeWorkspaceButton).toBeEnabled()
      await upgradeWorkspaceButton.click()

      const dialog = page.locator('dialog[open]')
      await expect(dialog).toBeVisible()
      await expect(dialog.getByRole('heading')).toContainText(/Upgrade for workspace E2E Test Workspace 1/i)
      await dialog.getByRole('button', { name: /Go to pricing/i }).click()

      await expect(page).toHaveURL(new RegExp(`${MARKETING_WEBSITE_URL}/pricing.*workspaceId`))

      // complete a checkout with core package
      await page.waitForLoadState('domcontentloaded')
      await page.getByRole('button', { name: /get started for free/i }).click()

      await page.waitForLoadState('domcontentloaded')
      await expect(page).toHaveURL(/checkout\.stripe\.com/)
      await expect(page.getByLabel('george-ai.net sandbox')).toBeVisible()
    })

    test('mock succesful core checkout', async ({ request }) => {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

      const payload = JSON.stringify({
        type: 'invoice.paid',
        data: {
          object: {
            parent: {
              subscription_details: {
                metadata: {
                  workspaceId: '00000000-0000-0000-0000-000000000002',
                  subscriptionType: 'core',
                },
                subscription: 'sub_test_1',
              },
            },
            lines: {
              data: [
                {
                  period: {
                    start: Math.floor(Date.now() / 1000),
                    end: Math.floor(Date.now() / 1000) + 2592000,
                  },
                },
              ],
            },
          },
        },
      })

      const stripeSignature = stripe.webhooks.generateTestHeaderString({
        payload,
        secret: process.env.STRIPE_WEBHOOK_SECRET!,
      })

      const response = await request.post(`${BACKEND_URL}/stripe/webhook`, {
        headers: {
          'stripe-signature': stripeSignature,
          'content-type': 'application/json',
        },
        data: payload,
      })

      expect(response.status()).toBe(200)

      // check entry in db
      const client = new Client({ connectionString: process.env.DATABASE_URL })
      await client.connect()

      const result = await client.query(
        `SELECT * FROM "Payment" WHERE "workspaceId" = $1 ORDER BY "validFrom" DESC LIMIT 1`,
        ['00000000-0000-0000-0000-000000000002'],
      )

      expect(result.rows.length).toBe(1)
      expect(result.rows[0].subscriptionType).toBe('core')

      await client.end()
    })

    test('confirm success after checkout', async ({ page }) => {
      await page.waitForLoadState('networkidle')

      // check success page
      await page.goto('localhost:4321/success')
      await expect(page.getByRole('heading', { name: 'Payment Successful', level: 1 })).toBeVisible()
      await page.getByRole('link', { name: /go back to workspaces/i }).click()

      // confirm correct workspace
      await switchWorkspace(page, 'E2E Test Workspace 1')

      // navigate to upgrade workspace dialog
      const sidebar = page.getByRole('complementary', { name: /main menu/i })
      await sidebar.getByLabel('Open sidebar').click({ force: true })

      // head to pricing options
      const upgradeWorkspaceButton = sidebar.getByRole('button', { name: /upgrade workspace/i })
      await expect(upgradeWorkspaceButton).toBeEnabled()
      await upgradeWorkspaceButton.click()

      const dialog = page.locator('dialog[open]')
      await expect(dialog).toBeVisible()
      await expect(dialog).toContainText(/Core/i)
    })
  })

  test('mock succesful pro checkout', async ({ request }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const payload = JSON.stringify({
      type: 'invoice.paid',
      data: {
        object: {
          parent: {
            subscription_details: {
              metadata: {
                workspaceId: '00000000-0000-0000-0000-000000000003',
                subscriptionType: 'pro',
              },
              subscription: 'sub_test_2',
            },
          },
          lines: {
            data: [
              {
                period: {
                  start: Math.floor(Date.now() / 1000),
                  end: Math.floor(Date.now() / 1000) + 2592000,
                },
              },
            ],
          },
        },
      },
    })

    const stripeSignature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET!,
    })

    const response = await request.post(`${BACKEND_URL}/stripe/webhook`, {
      headers: {
        'stripe-signature': stripeSignature,
        'content-type': 'application/json',
      },
      data: payload,
    })

    expect(response.status()).toBe(200)

    // check entry in db
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()

    const result = await client.query(
      `SELECT * FROM "Payment" WHERE "workspaceId" = $1 ORDER BY "validFrom" DESC LIMIT 1`,
      ['00000000-0000-0000-0000-000000000003'],
    )

    expect(result.rows.length).toBe(1)
    expect(result.rows[0].subscriptionType).toBe('pro')

    await client.end()
  })

  test('mock checkout with invalid workspaceId', async ({ request }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const payload = JSON.stringify({
      type: 'invoice.paid',
      data: {
        object: {
          parent: {
            subscription_details: {
              metadata: {
                workspaceId: 'invalid-workspace-id',
                subscriptionType: 'core',
              },
              subscription: 'sub_test_3',
            },
          },
          lines: {
            data: [
              {
                period: {
                  start: Math.floor(Date.now() / 1000),
                  end: Math.floor(Date.now() / 1000) + 2592000,
                },
              },
            ],
          },
        },
      },
    })

    const stripeSignature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET!,
    })

    const response = await request.post(`${BACKEND_URL}/stripe/webhook`, {
      headers: {
        'stripe-signature': stripeSignature,
        'content-type': 'application/json',
      },
      data: payload,
    })

    expect(response.status()).toBe(200)

    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()

    const result = await client.query(
      `SELECT * FROM "Payment" WHERE "workspaceId" IS NULL ORDER BY "validFrom" DESC LIMIT 1`,
    )

    expect(result.rows.length).toBe(1)
    expect(result.rows[0].subscriptionType).toBe('core')

    await client.end()
  })

  test('mock checkout with missing workspaceId', async ({ request }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const payload = JSON.stringify({
      type: 'invoice.paid',
      data: {
        object: {
          parent: {
            subscription_details: {
              metadata: {
                subscriptionType: 'core',
              },
              subscription: 'sub_test_4',
            },
          },
          lines: {
            data: [
              {
                period: {
                  start: Math.floor(Date.now() / 1000),
                  end: Math.floor(Date.now() / 1000) + 2592000,
                },
              },
            ],
          },
        },
      },
    })

    const stripeSignature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET!,
    })

    const response = await request.post(`${BACKEND_URL}/stripe/webhook`, {
      headers: {
        'stripe-signature': stripeSignature,
        'content-type': 'application/json',
      },
      data: payload,
    })

    expect(response.status()).toBe(200)

    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()

    const result = await client.query(
      `SELECT * FROM "Payment" WHERE "workspaceId" IS NULL ORDER BY "validFrom" DESC LIMIT 1`,
    )

    expect(result.rows.length).toBe(1)
    expect(result.rows[0].subscriptionType).toBe('core')

    await client.end()
  })

  test('reject webhook with invalid signature', async ({ request }) => {
    const payload = JSON.stringify({
      type: 'invoice.paid',
      data: { object: {} },
    })

    const response = await request.post(`${BACKEND_URL}/stripe/webhook`, {
      headers: {
        'stripe-signature': 'invalid-signature',
        'content-type': 'application/json',
      },
      data: payload,
    })

    expect(response.status()).toBe(400)
  })

  test('check cancel page working', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // check cancel page
    await page.goto(`${MARKETING_WEBSITE_URL}/cancel`)
    await expect(page.getByRole('heading', { name: 'Payment unsuccessful', level: 1 })).toBeVisible()
  })
})
