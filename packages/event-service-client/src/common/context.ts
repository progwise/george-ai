import z from 'zod'

export const ContextSchema = z.record(
  z
    .string()
    .or(z.number())
    .or(z.boolean().or(z.array(z.any()))),
)

export type Context = z.infer<typeof ContextSchema>
