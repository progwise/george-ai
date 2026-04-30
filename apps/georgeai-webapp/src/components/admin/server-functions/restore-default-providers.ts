import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const restoreDefaultProvidersMutationDocument = graphql(`
  mutation RestoreDefaultProviders {
    restoreDefaultProviders {
      created
      skipped
      providers {
        hostId
        name
        driver
        url
        enabled
        configuredVramGb
      }
    }
  }
`)

export const restoreDefaultProvidersFn = createServerFn({ method: 'POST' }).handler(async () => {
  const result = await backendRequest(restoreDefaultProvidersMutationDocument, {})
  return result.restoreDefaultProviders
})
