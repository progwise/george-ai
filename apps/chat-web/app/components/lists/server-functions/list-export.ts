import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

// Query for export data - now uses centralized fieldValues
const exportDataDocument = graphql(`
  query ListExportData($listId: String!, $skip: Int!, $take: Int!, $fieldIds: [String!]!) {
    aiList(id: $listId) {
      ...ListExport_List
    }
    aiListItems(listId: $listId, fieldIds: $fieldIds, skip: $skip, take: $take) {
      count
      items {
        origin {
          id
          name
          libraryId
          libraryName
        }
        values {
          fieldId
          fieldName
          displayValue
        }
      }
    }
  }
`)

// Server function for getting export data
export const getListExportData = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      listId: z.string(),
      skip: z.number(),
      take: z.number(),
      fieldIds: z.array(z.string()),
    }),
  )
  .handler(async (ctx) => {
    return await backendRequest(exportDataDocument, ctx.data)
  })

// Query options for export data
export const getListExportDataOptions = (listId: string, skip: number, take: number, fieldIds: string[]) =>
  queryOptions({
    queryKey: ['ListExportData', listId, skip, take, fieldIds],
    queryFn: () => getListExportData({ data: { listId, skip, take, fieldIds } }),
  })
