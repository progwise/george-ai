import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'

import { useTranslation } from '../../i18n/use-translation-hook'
import { aiLibraryFilesQueryOptions } from '../../server-functions/library'

interface EmbeddingsTablePaginationProps {
  libraryId: string
}

export const EmbeddingsTableItemsPerPageSelector = ({ libraryId }: EmbeddingsTablePaginationProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const search = useSearch({ from: '/_authenticated/libraries/$libraryId/' })
  const { itemsPerPage } = search

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value, 10)
    navigate({
      to: '/libraries/$libraryId',
      params: { libraryId },
      search: {
        ...search,
        itemsPerPage: newItemsPerPage,
        page: 1,
      },
      replace: true,
    })
  }

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{t('labels.filesPerPage')}:</legend>
      <select className="select select-sm" value={itemsPerPage} onChange={handleItemsPerPageChange}>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
      </select>
    </fieldset>
  )
}

export const EmbeddingsTablePagination = ({ libraryId }: EmbeddingsTablePaginationProps) => {
  const search = useSearch({ from: '/_authenticated/libraries/$libraryId/' })
  const { column, direction, page, itemsPerPage } = search
  const { data } = useSuspenseQuery(aiLibraryFilesQueryOptions(libraryId, column, direction, page, itemsPerPage))

  const totalPages = Math.ceil(data.totalCount / itemsPerPage)
  const isFirstPage = page === 1
  const isLastPage = page === totalPages

  return (
    <div className="mt-4 flex justify-center">
      <div className="join">
        <Link
          className={twMerge('join-item btn', isFirstPage && 'btn-disabled')}
          disabled={isFirstPage}
          to="/libraries/$libraryId"
          params={{ libraryId }}
          search={{ ...search, page: page - 1 }}
        >
          «
        </Link>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
          <Link
            className="join-item btn"
            activeProps={{ className: 'btn-active' }}
            to="/libraries/$libraryId"
            params={{ libraryId }}
            search={{
              ...search,
              page: pageNumber,
            }}
            key={pageNumber}
          >
            {pageNumber}
          </Link>
        ))}

        <Link
          className={twMerge('join-item btn', isLastPage && 'btn-disabled')}
          disabled={isLastPage}
          to="/libraries/$libraryId"
          params={{ libraryId }}
          search={{ ...search, page: page + 1 }}
        >
          »
        </Link>
      </div>
    </div>
  )
}
