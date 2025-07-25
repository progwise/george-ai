import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

interface PaginationProps {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  onPageChange: (page: number) => void
  className?: string
}
// NO COMMIT

export const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  className = '',
}: PaginationProps) => {
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
    <nav className={`join items-center gap-0.5 md:gap-2 ${className}`}>
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
  )
}
