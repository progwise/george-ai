import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { backendRequest } from './backend'

const DeleteMessageDocument = graphql(`
  mutation deleteMessage($messageId: String!) {
    deleteMessage(messageId: $messageId) {
      id
    }
  }
`)
export const deleteMessage = createServerFn({ method: 'POST' })
  .validator((data: { messageId: string }) =>
    z
      .object({
        messageId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(DeleteMessageDocument, {
      messageId: ctx.data.messageId,
    }),
  )
