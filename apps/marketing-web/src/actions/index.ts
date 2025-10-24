import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import nodemailer from 'nodemailer'

export const server = {
  submitContactForm: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email address'),
      phone: z.string().optional(),
      company: z.string().optional(),
      message: z.string().min(1, 'Message is required'),
    }),
    handler: async (input) => {
      const { name, email, phone, company, message } = input

      // Get environment variables (fallback from import.meta.env to process.env for production)
      const smtpHostname = import.meta.env.SMTP_HOSTNAME || process.env.SMTP_HOSTNAME
      const smtpPort = import.meta.env.SMTP_PORT || process.env.SMTP_PORT
      const smtpUser = import.meta.env.SMTP_USER || process.env.SMTP_USER
      const smtpPassword = import.meta.env.SMTP_PASSWORD || process.env.SMTP_PASSWORD

      console.log('Contact form submission received from:', email)

      // Build email content
      const textContent = `
Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${company ? `Company: ${company}` : ''}

Message:
${message}
      `.trim()

      const htmlContent = `
<h2>New Contact Request from George-AI Website</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
      `.trim()

      try {
        // Configure nodemailer with Mailjet SMTP
        const transporter = nodemailer.createTransport({
          host: smtpHostname,
          port: Number(smtpPort),
          secure: false,
          auth: {
            user: smtpUser,
            pass: smtpPassword,
          },
        })

        // Send email
        await transporter.sendMail({
          from: 'info@george-ai.net',
          to: 'info@george-ai.net',
          subject: 'Contact Request from George-AI Website',
          text: textContent,
          html: htmlContent,
        })

        return { success: true }
      } catch (error) {
        console.error('Contact form error:', error)
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send contact request. Please try again later.',
        })
      }
    },
  }),
}
