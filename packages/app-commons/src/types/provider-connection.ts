import z from 'zod'

export const ProviderConnectionSchema = z.object({
  baseUrl: z.string().url().optional().nullable(),
  encryptedApiKey: z.string().optional().nullable(),
})

export type ProviderConnection = z.infer<typeof ProviderConnectionSchema>
