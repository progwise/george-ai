import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

// Query for export data - now uses centralized fieldValues
const exportDataDocument = graphql(`
  query ListExportData($listId: String!, $skip: Int!, $take: Int!, $fieldIds: [String!]!, $language: String!) {
    aiList(id: $listId) {
      ...ListExport_List
    }
    aiListFiles(listId: $listId, skip: $skip, take: $take, orderBy: "name", orderDirection: "asc") {
      count
      files {
        id
        name
        libraryId
        fieldValues(fieldIds: $fieldIds, language: $language) {
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
      language: z.string(),
    }),
  )
  .handler(async (ctx) => {
    return await backendRequest(exportDataDocument, ctx.data)
  })

// Query options for export data
export const getListExportDataOptions = (
  listId: string,
  skip: number,
  take: number,
  fieldIds: string[],
  language: string,
) =>
  queryOptions({
    queryKey: ['ListExportData', listId, skip, take, fieldIds, language],
    queryFn: () => getListExportData({ data: { listId, skip, take, fieldIds, language } }),
  })
