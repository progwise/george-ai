import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const reorderListFields = createServerFn({ method: 'POST' })
  .validator((data: { fieldId: string; newPlace: number }) =>
    z
      .object({
        fieldId: z.string(),
        newPlace: z.number().min(0),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(
      graphql(`
        mutation reorderListFields($fieldId: String!, $newPlace: Int!) {
          reorderListFields(fieldId: $fieldId, newPlace: $newPlace) {
            id
            name
            order
          }
        }
      `),
      {
        fieldId: ctx.data.fieldId,
        newPlace: ctx.data.newPlace,
      },
    ),
  )
