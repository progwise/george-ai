import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

import { useTranslation } from '../../i18n/use-translation-hook'

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

interface PaginationProps {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  onPageChange: (page: number) => void
  className?: string
  // Page size selector options
  showPageSizeSelector?: boolean
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
}

export const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  className = '',
  showPageSizeSelector = false,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
}: PaginationProps) => {
  const { t } = useTranslation()
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / itemsPerPage)
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    onPageChange(page)
  }

  useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange(totalPages)
    }
  }, [currentPage, totalPages, onPageChange])

  return (
    <div className={twMerge('flex items-end gap-4', className)}>
      {showPageSizeSelector && onPageSizeChange && (
        <div className="flex flex-col gap-1">
          <div className="text-xs">{t('lists.files.pageSize')}:</div>
          <select
            className="select select-sm select-bordered h-full"
            value={itemsPerPage}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      <nav className="join flex-shrink-0 items-center gap-0.5 md:gap-2">
        <button
          type="button"
          className={twMerge('join-item btn btn-xs', isFirstPage && 'btn-disabled')}
          aria-label="First Page"
          aria-disabled={isFirstPage}
          onClick={() => handlePageChange(1)}
          disabled={isFirstPage}
        >
          &lt;&lt;
        </button>
        <button
          type="button"
          className={twMerge('join-item btn btn-xs', isFirstPage && 'btn-disabled')}
          aria-label="Previous Page"
          aria-disabled={isFirstPage}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        <span className="text-nowrap text-xs">
          {currentPage}/{totalPages}
        </span>
        <button
          type="button"
          aria-label="Next Page"
          className={twMerge('join-item btn btn-xs', isLastPage && 'btn-disabled')}
          aria-disabled={isLastPage}
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          &gt;
        </button>
        <button
          type="button"
          aria-label="Last Page"
          className={twMerge('join-item btn btn-xs', isLastPage && 'btn-disabled')}
          aria-disabled={isLastPage}
          disabled={isLastPage}
          onClick={() => handlePageChange(totalPages)}
        >
          &gt;&gt;
        </button>
      </nav>
    </div>
  )
}
