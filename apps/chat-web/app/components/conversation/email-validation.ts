import { z } from 'zod'

const emailSchema = z.string().email()

export const validateEmails = (input: string | string[]) => {
  const emails = Array.isArray(input) ? input : input.split(',').map((email) => email.trim())
  const invalidEmails = emails.filter((email) => !emailSchema.safeParse(email).success)
  return { emails, invalidEmails }
}
