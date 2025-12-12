import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { getManagedUsersQueryOptions } from '../../../../components/admin/users/get-managed-users'
import { StatusFilterValues, UserFilters } from '../../../../components/admin/users/user-filters'
import { UserStats } from '../../../../components/admin/users/user-stats'
import { UserTable } from '../../../../components/admin/users/user-table'
import { Pagination } from '../../../../components/table/pagination'
import { useTranslation } from '../../../../i18n/use-translation-hook'
import { UsersIcon } from '../../../../icons/users-icon'

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
  const { user, queryClient } = Route.useRouteContext()
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const {
    data: { managedUsers },
  } = useSuspenseQuery(getManagedUsersQueryOptions(search.skip, search.take, search.filter, search.statusFilter))

  const { t } = useTranslation()

  const { users, userStatistics } = managedUsers

  return (
    <div className="container mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          <div className="rounded-full bg-linear-to-br from-primary/20 to-primary/10 p-3 shadow-lg">
            <UsersIcon className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">{t('labels.allUsers')}</h1>
            <p className="text-lg opacity-70">Manage user accounts and permissions</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-8">
        <UserStats stats={userStatistics} statusFilter={search.statusFilter} />
      </div>

      {/* Filters and Controls */}
      <div className="mb-8 rounded-xl border border-base-300/50 bg-base-100 p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-primary"></div>
          <h2 className="text-xl font-semibold">Search & Filter</h2>
        </div>

        <UserFilters
          filter={search.filter || ''}
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
      </div>

      {/* Results Section */}
      <div className="overflow-hidden rounded-xl border border-base-300/50 bg-base-100 shadow-lg">
        {/* Results Header */}
        <div className="border-b border-base-300/50 bg-linear-to-r from-primary/5 to-secondary/5 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-secondary"></div>
              <h2 className="text-xl font-semibold">User Directory</h2>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Results counter */}
              <div className="rounded-lg bg-base-200/80 px-4 py-2 text-sm">
                {userStatistics.total > 0
                  ? t('texts.showingUsers', {
                      start: search.skip + 1,
                      end: search.skip + users.length,
                      total: userStatistics.total,
                    })
                  : t('texts.noUsersFound')}
              </div>

              {/* Pagination */}
              {userStatistics.total > search.take && (
                <Pagination
                  totalItems={userStatistics.total}
                  itemsPerPage={search.take}
                  currentPage={search.skip / search.take + 1}
                  onPageChange={(page) => {
                    const newSkip = (page - 1) * search.take
                    // Prevent navigation beyond available data
                    if (newSkip < userStatistics.total) {
                      navigate({ search: { ...search, skip: newSkip } })
                    }
                  }}
                  showPageSizeSelector={true}
                  onPageSizeChange={(newPageSize) => {
                    navigate({ search: { ...search, skip: 0, take: newPageSize } })
                  }}
                  className="rounded-lg bg-base-100/80 shadow-sm"
                />
              )}
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="p-6">
          {userStatistics.total > 0 ? (
            <UserTable
              users={users}
              currentUser={user}
              onChange={() =>
                queryClient.invalidateQueries(
                  getManagedUsersQueryOptions(search.skip, search.take, search.filter, search.statusFilter),
                )
              }
            />
          ) : (
            <div className="py-16 text-center">
              <div className="mb-4 inline-block rounded-full bg-base-200/50 p-4">
                <UsersIcon className="size-12 text-base-content/40" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {search.filter || search.statusFilter !== 'all' ? 'No Matching Users' : 'No Users Found'}
              </h3>
              <p className="text-base-content/60">
                {search.filter || search.statusFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters to find users.'
                  : 'There are no users in the system yet.'}
              </p>
              {(search.filter || search.statusFilter !== 'all') && (
                <button
                  type="button"
                  className="btn mt-4 btn-outline btn-primary"
                  onClick={() => navigate({ search: { skip: 0, take: search.take, filter: '', statusFilter: 'all' } })}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Pagination (for long lists) */}
      {userStatistics.total > search.take && users.length > 10 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            totalItems={userStatistics.total}
            itemsPerPage={search.take}
            currentPage={search.skip / search.take + 1}
            onPageChange={(page) => {
              const newSkip = (page - 1) * search.take
              if (newSkip < userStatistics.total) {
                navigate({ search: { ...search, skip: newSkip } })
              }
            }}
            showPageSizeSelector={false}
            className="rounded-lg border border-base-300/50 bg-base-100 px-4 py-2 shadow-lg"
          />
        </div>
      )}
    </div>
  )
}
