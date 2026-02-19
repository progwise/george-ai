import { sendMail } from '@george-ai/mailer'

import { getConfig } from '../config'

export const sendInvitationEmail = async ({
  email,
  conversationId,
  invitationId,
}: {
  email: string
  conversationId: string
  invitationId: string
}) => {
  const link = `${getConfig('PUBLIC_APP_URL')}/conversations/${conversationId}/confirm-invitation/${invitationId}`
  const subject = 'You are invited to a conversation at George-Ai'
  const text = `You have been invited to join a conversation at George-Ai (george-ai.net). Use this link to join: ${link}`
  const html = `<p>You have been invited to join a conversation at George-Ai (george-ai.net). Use this link to join: <a href="${link}">${link}</a></p>`

  await sendMail(email, subject, text, html)
}
