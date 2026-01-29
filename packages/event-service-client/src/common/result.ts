import z from 'zod'

export const ResultSchema = z.record(
  z
    .string()
    .or(z.number())
    .or(z.boolean().or(z.array(z.any()))),
)

export type Result = z.infer<typeof ResultSchema>
