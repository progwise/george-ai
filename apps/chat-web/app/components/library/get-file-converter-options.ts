import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

const fileConverterOptionsDocument = graphql(`
  query aiFileConverterOptions {
    aiFileConverterOptions {
      pdf {
        title {
          de
          en
        }
        settings {
          name
          label {
            de
            en
          }
          description {
            de
            en
          }
        }
      }
    }
  }
`)

const getFileConverterOptions = createServerFn({ method: 'GET' }).handler(async () => {
  return backendRequest(fileConverterOptionsDocument)
})

export const getFileConverterOptionsOptions = () =>
  queryOptions({
    queryKey: ['aiFileConverterOptions'],
    queryFn: () => getFileConverterOptions(),
  })
