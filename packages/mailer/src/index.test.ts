import { describe, expect, it } from 'vitest'

import {
  SMTP_HOSTNAME,
  SMTP_PASSWORD,
  SMTP_TEST_RECIPIENT,
  SMTP_USER,
} from './global-config'
import { sendMail } from './index'

describe('Mailer Integration Test', () => {
  it.skipIf(
    !SMTP_HOSTNAME || !SMTP_USER || !SMTP_PASSWORD || !SMTP_TEST_RECIPIENT,
  )(
    'should send a real test email',
    { timeout: 10000 }, // 10 second timeout for email sending
    async () => {
      const testEmail = SMTP_TEST_RECIPIENT!

      const result = await sendMail(
        testEmail,
        'George AI Mailer Test',
        'This is a test email from the George AI mailer package.',
        '<html><body><h1>Test Email</h1><p>This is a test email from the George AI mailer package.</p></body></html>',
      )

      // Verify email was accepted
      expect(result.accepted).toContain(testEmail)
      expect(result.messageId).toBeDefined()

      console.log('✅ Test email sent successfully!')
      console.log(`Message ID: ${result.messageId}`)
      console.log(`Sent to: ${testEmail}`)
    },
  )

  it('should handle invalid email address', async () => {
    if (!SMTP_HOSTNAME || !SMTP_USER || !SMTP_PASSWORD) {
      console.log('⏭️  Skipping test - SMTP not configured')
      return
    }

    await expect(
      sendMail('invalid-email', 'Test', 'Text', '<p>HTML</p>'),
    ).rejects.toThrow()
  })
})
