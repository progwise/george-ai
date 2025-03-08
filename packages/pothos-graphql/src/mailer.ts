import { createTransport } from 'nodemailer'

const smtp_hostname = process.env.SMTP_HOSTNAME || ''
const smtp_port = process.env.SMTP_PORT || '587'
const smtp_user = process.env.SMTP_USER || ''
const smtp_password = process.env.SMTP_PASSWORD || ''

const transporter = createTransport({
  host: smtp_hostname,
  port: parseInt(smtp_port),
  secure: false,
  auth: {
    user: smtp_user,
    pass: smtp_password,
  },
})

export const sendMail = async (to: string, subject: string, text: string, html: string) => {
  return await transporter.sendMail({
    from: 'into@george-ai.net',
    to,
    subject,
    text,
    html,
  })
}
