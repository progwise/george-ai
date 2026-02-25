import z from 'zod'

export const DateTimeSchema = z.coerce.date()
