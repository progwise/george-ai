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
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pageInputRef = useRef<HTMLInputElement>(null)
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / itemsPerPage)
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages
  const onlyOnePage = totalPages === 1

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    onPageChange(page)
  }

  const handlePageInput = () => {
    if (!dialogRef.current) return
    dialogRef.current.showModal()
    if (!pageInputRef.current) return
    pageInputRef.current.value = currentPage.toString()
    pageInputRef.current.select()
    // Focus the input after a short delay to ensure the dialog is fully rendered
    setTimeout(() => {
      pageInputRef.current?.focus()
    }, 100)
  }

  useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange(totalPages)
    }
  }, [currentPage, totalPages, onPageChange])

  return (
    <>
      <dialog ref={dialogRef} id="pageEnterDialog" className="modal modal-bottom sm:modal-middle">
        <form
          method="dialog"
          className="w-100 flex justify-center p-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!pageInputRef.current) return
            const page = parseInt(pageInputRef.current.value, 10)
            if (isNaN(page) || page < 1 || page > totalPages) {
              // Invalid page number, do nothing
              return
            }
            onPageChange(page)
            dialogRef.current?.close()
          }}
        >
          <label className="input w-full">
            <span>{t('labels.gotoPage')}</span>
            <input ref={pageInputRef} type="text" className="grow text-center" placeholder={currentPage.toString()} />
            <span>{t('labels.ofPages', { totalPages })}</span>
          </label>
        </form>
      </dialog>
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
          <button
            type="button"
            className={twMerge('join-item btn btn-xs', onlyOnePage && 'btn-disabled')}
            onClick={() => {
              handlePageInput()
            }}
          >
            <span className="flex-nowrap text-nowrap text-xs font-normal">
              {currentPage}/{totalPages}
            </span>
          </button>
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
    </>
  )
}
