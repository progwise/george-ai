import { useEffect, useRef } from 'react'
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
  const dropDownRef = useRef<HTMLDetailsElement>(null)
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / itemsPerPage)
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages
  const onlyOnePage = totalPages === 1

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    onPageChange(newPage)
  }

  const handlePageManualChange = (value: string) => {
    const newPage = Number(value)
    if (isNaN(newPage)) return
    handlePageChange(newPage)
    if (dropDownRef.current) {
      dropDownRef.current.removeAttribute('open')
    }
  }

  useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange(totalPages)
    }
  }, [currentPage, totalPages, onPageChange])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target as Node)) {
        dropDownRef.current.removeAttribute('open')
      }
    }

    const observer = new MutationObserver(() => {
      if (dropDownRef.current?.open) {
        dropDownRef.current.querySelector('input')?.focus()
      }
    })

    if (dropDownRef.current) {
      observer.observe(dropDownRef.current, { attributes: true, attributeFilter: ['open'] })
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      observer.disconnect()
    }
  }, [])

  return (
    <div className={twMerge('flex items-end gap-4', className)}>
      <div className="join">
        <button
          type="button"
          className={twMerge('join-item btn btn-xs', isFirstPage && 'btn-disabled')}
          aria-label="First Page"
          aria-disabled={isFirstPage}
          onClick={() => handlePageChange(1)}
          disabled={isFirstPage}
        >
          «
        </button>
        <button
          type="button"
          className={twMerge('join-item btn btn-xs', isFirstPage && 'btn-disabled')}
          aria-label="Previous Page"
          aria-disabled={isFirstPage}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹
        </button>
        <details
          ref={dropDownRef}
          className="dropdown dropdown-end"
          onKeyDown={(event) => {
            if (event.key === 'Escape' || event.key === 'Return') {
              dropDownRef.current?.removeAttribute('open')
            }
          }}
        >
          <summary role="button" className={twMerge('join-item btn btn-xs', onlyOnePage && 'btn-disabled')}>
            <span className="flex-nowrap text-nowrap text-xs font-normal">
              {currentPage}/{totalPages}
            </span>
          </summary>
          <label className="input dropdown-content bg-base-100 rounded-box z-1 w-64 p-2 shadow-sm" tabIndex={0}>
            {t('labels.gotoPage')}
            <input
              type="number"
              min="1"
              max={`${totalPages}`}
              className="grow text-center"
              placeholder={currentPage.toString()}
              onBlur={(event) => handlePageManualChange(event.target.value)}
            />
            <span>{t('labels.ofPages', { totalPages })}</span>
          </label>
        </details>

        <button
          type="button"
          aria-label="Next Page"
          className={twMerge('join-item btn btn-xs', isLastPage && 'btn-disabled')}
          aria-disabled={isLastPage}
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          ›
        </button>
        <button
          type="button"
          aria-label="Last Page"
          className={twMerge('join-item btn btn-xs', isLastPage && 'btn-disabled')}
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
    </div>
  )
}
