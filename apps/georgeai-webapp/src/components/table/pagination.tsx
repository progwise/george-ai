import React, { useEffect, useId } from 'react'
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
  const popoverId = useId()
  const { t } = useTranslation()
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / itemsPerPage)
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    onPageChange(newPage)
  }

  const handlePageManualChange = (value: string) => {
    const newPage = Number(value)
    if (isNaN(newPage)) return
    handlePageChange(newPage)
  }

  const closePopover = () => {
    const popover = document.getElementById(popoverId)
    popover?.hidePopover()
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handlePageManualChange(event.currentTarget.value)
      closePopover()
    } else if (event.key === 'Escape') {
      closePopover()
    }
  }

  useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange(totalPages)
    }
  }, [currentPage, totalPages, onPageChange])

  return (
    <div className={twMerge('flex items-end gap-4', className)}>
      <div className="join">
        <button
          type="button"
          className={twMerge('btn join-item btn-xs')}
          aria-label="First Page"
          aria-disabled={isFirstPage}
          onClick={() => handlePageChange(1)}
          disabled={isFirstPage}
        >
          «
        </button>
        <button
          type="button"
          className={twMerge('btn join-item btn-xs')}
          aria-label="Previous Page"
          aria-disabled={isFirstPage}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹
        </button>
        <div className="btn join-item border btn-xs">
          <button type="button" popoverTarget={popoverId} style={{ anchorName: '--anchor-1' } as React.CSSProperties}>
            <span className="flex-nowrap text-xs font-normal text-nowrap">
              {currentPage}/{totalPages}
            </span>
          </button>
          <label
            style={{ positionAnchor: '--anchor-1' } as React.CSSProperties}
            className="dropdown input dropdown-end w-64 rounded-box bg-base-100 p-2 shadow-sm"
            tabIndex={0}
            popover="auto"
            id={popoverId}
          >
            {t('labels.gotoPage')}
            <input
              type="number"
              min="1"
              max={`${totalPages}`}
              className="grow text-center"
              placeholder={currentPage.toString()}
              onBlur={(event) => {
                handlePageManualChange(event.target.value)
                closePopover()
              }}
              onKeyDown={handleInputKeyDown}
            />
            <span>{t('labels.ofPages', { totalPages })}</span>
          </label>
        </div>
        <button
          type="button"
          aria-label="Next Page"
          className={twMerge('btn join-item btn-xs')}
          aria-disabled={isLastPage}
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          ›
        </button>
        <button
          type="button"
          aria-label="Last Page"
          className={twMerge('btn join-item btn-xs')}
          aria-disabled={isLastPage}
          disabled={isLastPage}
          onClick={() => handlePageChange(totalPages)}
        >
          »
        </button>
      </div>
      {showPageSizeSelector && onPageSizeChange && (
        <div className="flex flex-col gap-1">
          <select
            className="select h-full select-sm"
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
    </div>
  )
}
