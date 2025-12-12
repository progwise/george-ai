import { useNavigate } from '@tanstack/react-router'

import { AiListFilterType } from '../../gql/graphql'
import { useLocalstorage } from '../../hooks/use-local-storage'

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

export interface FieldSorting {
  fieldId: string
  direction: 'asc' | 'desc'
}

export interface ListSorting {
  listId: string
  sorting: FieldSorting[]
}

export const useListSettings = (listId: string) => {
  const navigate = useNavigate()
  const [filters, setFilters] = useLocalstorage<FieldFilter[]>(`ListFilters-${listId}`)
  const [sorting, setSorting] = useLocalstorage<FieldSorting[]>(`ListSorting-${listId}`)

  const getFilterValue = (fieldId: string, filterType: FieldFilter['filterType']) => {
    if (!filters) return ''
    const filter = filters.find((f) => f.fieldId === fieldId && f.filterType === filterType)
    return filter ? filter.value : ''
  }

  const removeFilter = (fieldId: string, filterType: FieldFilter['filterType']) => {
    if (!filters) return []

    setFilters((old) => (old || []).filter((f) => !(f.fieldId === fieldId && f.filterType === filterType)))
  }

  const clearFieldFilters = (fieldId: string) => {
    setFilters((old) => (old || []).filter((f) => f.fieldId !== fieldId))
  }

  const clearAllFilters = () => setFilters([])

  const updateFilter = (args: { fieldId: string; filterType: FieldFilter['filterType']; value: string }) => {
    const { fieldId, filterType, value } = args
    setFilters((old) => {
      const withoutCurrent = (old || []).filter((f) => !(f.fieldId === fieldId && f.filterType === filterType))
      return [...withoutCurrent, { fieldId, filterType, value }]
    })
  }

  const getSortingDirection = (fieldId: string) => {
    if (!sorting) return null
    const sort = sorting.find((s) => s.fieldId === fieldId)
    return sort ? sort.direction : null
  }

  const toggleSorting = (fieldId: string) => {
    const currentDirection = getSortingDirection(fieldId)
    let newDirection: 'asc' | 'desc' | null = 'asc'
    if (!currentDirection) newDirection = 'asc'
    else if (currentDirection === 'asc') newDirection = 'desc'
    else newDirection = null

    if (newDirection) {
      // Add or update sorting
      setSorting((old) => {
        const withoutCurrent = (old || []).filter((s) => s.fieldId !== fieldId)
        return [...withoutCurrent, { fieldId, direction: newDirection! }]
      })
    } else {
      // Remove sorting
      setSorting((old) => (old || []).filter((s) => s.fieldId !== fieldId))
    }
  }

  const clearAllSorting = () => setSorting([])

  const removeSelectedItem = async () => {
    await navigate({
      to: '/lists/$listId',
      params: { listId },
      search: {
        selectedItemId: undefined,
      },
    })
  }

  return {
    filters: filters || [],
    getFilterValue,
    updateFilter,
    removeFilter,
    removeSelectedItem,
    clearFieldFilters,
    clearAllFilters,
    sorting: sorting || [],
    getSortingDirection,
    toggleSorting,
    clearAllSorting,
  }
}
