import { useMemo } from 'react'

import { debounce } from '@george-ai/web-utils'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { SearchIcon } from '../../../icons/search-icon'
import { Listbox } from '../../listbox'

//Statistics now show global counts with contextual total label for better UX
export const StatusFilterValues = ['all', 'confirmed', 'unconfirmed', 'activated', 'unactivated'] as const

interface UserFiltersProps {
  filter: string
  onFilterChange: (term: string) => void
  statusFilter: (typeof StatusFilterValues)[number]
  onStatusFilterChange: (statusFilter: (typeof StatusFilterValues)[number]) => void
  pageSize: number
  onPageSizeChange: (size: number) => void
}

export const UserFilters = ({
  filter,
  onFilterChange,
  statusFilter,
  onStatusFilterChange,
  pageSize,
  onPageSizeChange,
}: UserFiltersProps) => {
  const { t } = useTranslation()

  const statusOptions = useMemo(
    () =>
      StatusFilterValues.map((value) => ({
        id: value,
        name: value === 'all' ? t('labels.allUsers') : t(`labels.${value}`),
      })),
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

  const handleFilterChange = debounce((newTerm: string) => {
    onFilterChange(newTerm.trim())
  }, 1000)

  return (
    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2 md:flex-1 md:flex-row md:items-center">
        <div className="md:min-w-2xs relative flex-grow md:w-96">
          <input
            type="text"
            placeholder={t('placeholders.searchUsers')}
            className="bg-base-100 focus:outline-primary w-full rounded-lg border px-2 py-1 pl-8 text-sm focus:outline-2"
            defaultValue={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
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
                onStatusFilterChange(item.id)
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
              onPageSizeChange(Number(item.id))
            }
          }}
        />
      </div>
    </div>
  )
}
