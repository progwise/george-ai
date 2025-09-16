import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'

import { AiListFilterType } from '../../gql/graphql'

export type FieldFilterType = `${AiListFilterType}`

export interface FieldFilter {
  fieldId: string
  filterType: FieldFilterType
  value: string
}

export interface ListFilters {
  listId: string
  filters: FieldFilter[]
}

export const useListFilters = (listId: string) => {
  const { queryClient } = useRouteContext({ from: '/_authenticated' })
  const queryKey = useMemo(() => ['ListFilters', listId], [listId])

  const { data: filters } = useSuspenseQuery({
    queryKey,
    queryFn: () => queryClient.getQueryData<FieldFilter[]>(queryKey) || [],
  })

  const getFilterValue = useCallback(
    (fieldId: string, filterType: FieldFilter['filterType']) => {
      const filter = filters.find((f) => f.fieldId === fieldId && f.filterType === filterType)
      return filter ? filter.value : ''
    },
    [filters],
  )

  const removeFilter = useCallback(
    (fieldId: string, filterType: FieldFilter['filterType']) => {
      queryClient.setQueryData<FieldFilter[]>(queryKey, (old) =>
        (old || []).filter((f) => !(f.fieldId === fieldId && f.filterType === filterType)),
      )
    },
    [queryKey, queryClient],
  )

  const clearFieldFilters = useCallback(
    (fieldId: string) => {
      queryClient.setQueryData<FieldFilter[]>(queryKey, (old) => (old || []).filter((f) => f.fieldId !== fieldId))
    },
    [queryKey, queryClient],
  )

  const clearAllFilters = useCallback(() => {
    queryClient.setQueryData<FieldFilter[]>(queryKey, [])
  }, [queryKey, queryClient])

  const updateFilter = useCallback(
    (args: { fieldId: string; filterType: FieldFilter['filterType']; value: string }) => {
      const { fieldId, filterType, value } = args
      queryClient.setQueryData<FieldFilter[]>(['ListFilters', listId], (old) => {
        const withoutCurrent = (old || []).filter((f) => !(f.fieldId === fieldId && f.filterType === filterType))
        return [...withoutCurrent, { fieldId, filterType, value }]
      })
      queryClient.invalidateQueries({ queryKey: ['AiListFilesWithValues'] })
    },
    [listId, queryClient],
  )

  return { filters, getFilterValue, updateFilter, removeFilter, clearFieldFilters, clearAllFilters }
}
