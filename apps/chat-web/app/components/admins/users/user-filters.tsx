import { useMemo } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { SearchIcon } from '../../../icons/search-icon'
import { Listbox } from '../../listbox'

export const UserFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  pageSize,
  setPageSize,
}: {
  searchTerm: string
  setSearchTerm: (term: string) => void
  statusFilter: 'all' | 'confirmed' | 'unconfirmed' | 'activated' | 'unactivated'
  setStatusFilter: (filter: 'all' | 'confirmed' | 'unconfirmed' | 'activated' | 'unactivated') => void
  pageSize: number
  setPageSize: (size: number) => void
}) => {
  const { t } = useTranslation()

  const statusOptions = useMemo(
    () => [
      { id: 'all', name: t('labels.allUsers') },
      { id: 'confirmed', name: t('labels.confirmed') },
      { id: 'unconfirmed', name: t('labels.unconfirmed') },
      { id: 'activated', name: t('labels.activated') },
      { id: 'unactivated', name: t('labels.unactivated') },
    ],
    [t],
  )

  const pageSizeOptions = useMemo(
    () => [
      { id: '10', name: '10' },
      { id: '25', name: '25' },
      { id: '50', name: '50' },
      { id: '100', name: '100' },
    ],
    [],
  )

  const selectedStatusOption = useMemo(
    () => statusOptions.find((option) => option.id === statusFilter) || statusOptions[0],
    [statusFilter, statusOptions],
  )

  const selectedPageSizeOption = useMemo(
    () => pageSizeOptions.find((option) => option.id === pageSize.toString()) || pageSizeOptions[0],
    [pageSize, pageSizeOptions],
  )

  return (
    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2 md:flex-1 md:flex-row md:items-center">
        <div className="md:min-w-2xs relative flex-grow md:w-96">
          <input
            type="text"
            placeholder={t('placeholders.searchUsers')}
            className="bg-base-100 focus:outline-primary w-full rounded-lg border px-2 py-1 pl-8 text-sm focus:outline-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2">
            <SearchIcon className="opacity-70" />
          </div>
        </div>
        <div className="min-w-52">
          <Listbox
            items={statusOptions}
            selectedItem={selectedStatusOption}
            onChange={(item) => {
              if (item) {
                setStatusFilter(item.id as 'all' | 'confirmed' | 'unconfirmed' | 'activated' | 'unactivated')
              }
            }}
          />
        </div>
      </div>
      <div className="w-24">
        <Listbox
          items={pageSizeOptions}
          selectedItem={selectedPageSizeOption}
          onChange={(item) => {
            if (item) {
              setPageSize(Number(item.id))
            }
          }}
        />
      </div>
    </div>
  )
}
