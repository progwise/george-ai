import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { InferenceDriverSchema, InferenceHostInputSchema } from '../../../gql/validation'
import { backendRequest } from '../../../server-functions/backend'

const CreateInferenceHostDataSchema = z.object({
  driver: InferenceDriverSchema,
  input: InferenceHostInputSchema(),
})

export const createInferenceHostFn = createServerFn({ method: 'POST' })
  .inputValidator((data: z.infer<typeof CreateInferenceHostDataSchema>) => CreateInferenceHostDataSchema.parse(data))
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation createInferenceHostFn($driver: InferenceDriver!, $data: InferenceHostInput!) {
          createInferenceHost(driver: $driver, data: $data) {
            hostId
            driver
            name
            enabled
          }
        }
      `),
      data,
    )
    return result.createInferenceHost
  })
