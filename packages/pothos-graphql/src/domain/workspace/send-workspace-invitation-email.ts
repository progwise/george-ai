import { prisma } from '@george-ai/app-domain'
import { sendMail } from '@george-ai/mailer'

import { PUBLIC_APP_URL } from '../../global-config'

export const INVITATION_EXPIRY_DAYS = 7

/**
 * Send a workspace invitation email
 *
 * @param invitationId - The invitation ID
 * @param workspaceId - The workspace ID
 * @param inviterId - The inviter's user ID
 * @param recipientEmail - The recipient's email address
 */
export async function sendWorkspaceInvitationEmail(
  invitationId: string,
  workspaceId: string,
  inviterId: string,
  recipientEmail: string,
) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { name: true },
  })

  const inviter = await prisma.user.findUnique({
    where: { id: inviterId },
    select: { name: true, email: true },
  })

  const inviteLink = `${PUBLIC_APP_URL}/accept-invitation/${invitationId}`
  const inviterName = inviter?.name || inviter?.email || 'Someone'

  await sendMail(
    recipientEmail,
    `You've been invited to join ${workspace?.name} on George AI`,
    `${inviterName} has invited you to join the workspace "${workspace?.name}" on George AI.\n\nClick here to accept: ${inviteLink}\n\nThis invitation expires in ${INVITATION_EXPIRY_DAYS} days.`,
    `<p>${inviterName} has invited you to join the workspace "<strong>${workspace?.name}</strong>" on George AI.</p>
    <p><a href="${inviteLink}">Click here to accept the invitation</a></p>
    <p>This invitation expires in ${INVITATION_EXPIRY_DAYS} days.</p>`,
  )
}
