import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { StatusFilterValues, UserFilters } from '../../../../components/admin/users/user-filters'
import { UserStats } from '../../../../components/admin/users/user-stats'
import { UserTable } from '../../../../components/admin/users/user-table'
import { Pagination } from '../../../../components/table/pagination'
import { useTranslation } from '../../../../i18n/use-translation-hook'
import { getManagedUsersQueryOptions } from './get-managed-users'

export const Route = createFileRoute('/_authenticated/admin/users/')({
  component: UsersList,
  validateSearch: z.object({
    skip: z.coerce.number().default(0),
    take: z.coerce.number().default(10),
    filter: z.string().optional(),
    statusFilter: z.enum(StatusFilterValues).default('all'),
  }),
  loaderDeps: ({ search: { skip, take, filter, statusFilter } }) => ({
    skip,
    take,
    filter,
    statusFilter,
  }),
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        getManagedUsersQueryOptions(deps.skip, deps.take, deps.filter, deps.statusFilter),
      ),
    ])
  },
})

function UsersList() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const {
    data: { managedUsers },
  } = useSuspenseQuery(getManagedUsersQueryOptions(search.skip, search.take, search.filter, search.statusFilter))

  const { t } = useTranslation()

  const { users, userStatistics } = managedUsers

  return (
    <div className="px-2 md:px-4">
      <div className="bg-base-100 sticky top-16 z-10 pb-4 pt-2">
        <h2 className="mb-4 text-lg font-bold">{t('labels.allUsers')}</h2>
        {/* Stats Cards */}
        <UserStats stats={userStatistics} />

        {/* Search and filters */}
        <UserFilters
          filter={search.filter || '*'}
          onFilterChange={(newTerm) => {
            navigate({ search: { ...search, filter: newTerm, skip: 0 } })
          }}
          statusFilter={search.statusFilter || 'all'}
          onStatusFilterChange={(newFilter) => {
            navigate({ search: { ...search, statusFilter: newFilter, skip: 0 } })
          }}
          pageSize={search.take || 10}
          onPageSizeChange={(newPageSize) => {
            navigate({ search: { ...search, take: newPageSize, skip: 0 } })
          }}
        />

        {/* Showing info and pagination */}
        <div className="mb-2 mt-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div className="text-sm">
            {t('texts.showingUsers', {
              start: users.length > 0 ? search.skip + 1 : 0,
              end: Math.min(search.skip + search.take, users.length),
              total: userStatistics.total,
            })}
          </div>
          {userStatistics.total / search.take > 1 && (
            <Pagination
              totalItems={userStatistics.total}
              itemsPerPage={search.take}
              currentPage={search.skip / search.take + 1}
              onPageChange={(page) => {
                navigate({ search: { ...search, skip: (page - 1) * search.take } })
              }}
            />
          )}
        </div>

        {/* User Table */}
        <UserTable users={users} />

        {userStatistics.total === 0 && (
          <div className="bg-base-200 mt-4 rounded-lg p-4 text-center">
            {search.filter || search.statusFilter !== 'all' ? t('texts.noUsersMatchFilters') : t('texts.noUsersFound')}
          </div>
        )}
      </div>
    </div>
  )
}
