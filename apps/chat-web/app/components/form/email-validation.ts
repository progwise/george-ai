import { z } from 'zod'

export const validateEmails = (emailString: string) => {
  const emails = emailString.split(',').map((e) => e.trim())
  const invalidEmails = emails.filter((e) => !z.string().email().safeParse(e).success)
  return { emails, invalidEmails }
}
