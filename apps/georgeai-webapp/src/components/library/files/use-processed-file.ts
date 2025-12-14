import { useNavigate, useSearch } from '@tanstack/react-router'

/**
 * Custom hook for managing pagination state in route params
 * Used for viewing per-row CSV files with pagination
 *
 * Returns pagination state and functions to update it via URL
 */
export function useProcessedFile() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as Record<string, unknown>

  // Get current page and pageSize from route params (default: page 1, pageSize 10)
  const page = typeof search.page === 'number' || typeof search.page === 'string' ? Number(search.page) || 1 : 1
  const pageSize =
    typeof search.pageSize === 'number' || typeof search.pageSize === 'string' ? Number(search.pageSize) || 10 : 10

  /**
   * Update current page
   */
  const setPage = (newPage: number) => {
    navigate({
      search: (prev: Record<string, unknown>) =>
        ({
          ...prev,
          page: newPage,
        }) as never,
    })
  }

  /**
   * Update page size (resets to page 1)
   */
  const setPageSize = (newPageSize: number) => {
    navigate({
      search: (prev: Record<string, unknown>) =>
        ({
          ...prev,
          page: 1, // Reset to first page when changing page size
          pageSize: newPageSize,
        }) as never,
    })
  }

  /**
   * Jump to a specific row number
   * Calculates the correct page based on current pageSize
   */
  const jumpToRow = (rowNumber: number) => {
    const targetPage = Math.ceil(rowNumber / pageSize)
    setPage(targetPage)
  }

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    jumpToRow,
  }
}
