import { Transporter, createTransport } from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'

import { SMTP_HOSTNAME, SMTP_PASSWORD, SMTP_PORT, SMTP_USER } from '../global-config'

// Lazy-initialized transporter - only created when first email is sent
let transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransport({
      host: SMTP_HOSTNAME,
      port: SMTP_PORT,
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    })
  }
  return transporter
}

export const sendMail = async (to: string, subject: string, text: string, html: string) => {
  try {
    return await getTransporter().sendMail({
      from: 'into@george-ai.net',
      to,
      subject,
      text,
      html,
    })
  } catch (e) {
    console.error('Error sending email', e)
    throw e
  }
}
