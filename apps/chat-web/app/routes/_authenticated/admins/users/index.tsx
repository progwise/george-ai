import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { SearchIcon } from '../../../../icons/search-icon'
import { queryKeys } from '../../../../query-keys'
import { getUsers } from '../../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/admins/users/')({
  beforeLoad: ({ context }) => {
    if (!context.user.isAdmin) {
      throw notFound()
    }
    return {}
  },
  component: UsersList,
})

function UsersList() {
  const { data } = useSuspenseQuery({
    queryKey: [queryKeys.Users],
    queryFn: () => getUsers(),
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'unconfirmed' | 'activated' | 'unactivated'>(
    'all',
  )
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Count stats
  const userStats = useMemo(() => {
    if (!data?.users) return { total: 0, confirmed: 0, unconfirmed: 0, activated: 0, unactivated: 0 }

    return data.users.reduce(
      (userStatistics, user) => {
        userStatistics.total++
        if (user.profile?.confirmationDate) {
          userStatistics.confirmed++
        } else {
          userStatistics.unconfirmed++
        }
        if (user.profile?.activationDate) {
          userStatistics.activated++
        } else {
          userStatistics.unactivated++
        }
        return userStatistics
      },
      { total: 0, confirmed: 0, unconfirmed: 0, activated: 0, unactivated: 0 },
    )
  }, [data?.users])

  // Filter users based on search term and status filter
  const filteredUsers = useMemo(() => {
    if (!data?.users) return []

    return data.users.filter((user) => {
      // Search filter
      const searchMatch =
        searchTerm === '' ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profile?.business?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profile?.position?.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      let statusMatch = true
      if (statusFilter === 'confirmed') statusMatch = !!user.profile?.confirmationDate
      if (statusFilter === 'unconfirmed') statusMatch = !user.profile?.confirmationDate
      if (statusFilter === 'activated') statusMatch = !!user.profile?.activationDate
      if (statusFilter === 'unactivated') statusMatch = !user.profile?.activationDate

      return searchMatch && statusMatch
    })
  }, [data?.users, searchTerm, statusFilter])

  // FilteredUsers to with pagination
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredUsers.slice(startIndex, startIndex + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  // Total pages calculation
  const totalPages = Math.ceil(filteredUsers.length / pageSize)

  // Sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  return (
    <div className="px-2 md:px-4">
      <h2 className="mb-4 text-lg font-bold">All Users</h2>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-5">
        <div className="stat bg-base-200 rounded-box shadow-sm">
          <div className="stat-title text-xs">Total Users</div>
          <div className="stat-value text-xl">{userStats.total}</div>
        </div>
        <div className="stat bg-base-200 rounded-box shadow-sm">
          <div className="stat-title text-xs">Confirmed</div>
          <div className="stat-value text-success text-xl">{userStats.confirmed}</div>
        </div>
        <div className="stat bg-base-200 rounded-box shadow-sm">
          <div className="stat-title text-xs">Unconfirmed</div>
          <div className="stat-value text-warning text-xl">{userStats.unconfirmed}</div>
        </div>
        <div className="stat bg-base-200 rounded-box shadow-sm">
          <div className="stat-title text-xs">Activated</div>
          <div className="stat-value text-success text-xl">{userStats.activated}</div>
        </div>
        <div className="stat bg-base-200 rounded-box shadow-sm">
          <div className="stat-title text-xs">Unactivated</div>
          <div className="stat-value text-warning text-xl">{userStats.unactivated}</div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-1 md:flex-row md:items-center">
          <div className="relative flex-grow md:w-96 md:min-w-[300px]">
            <input
              type="text"
              placeholder="Search users..."
              className="input input-bordered w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2">
              <SearchIcon className="opacity-70" />
            </div>
          </div>

          <select
            className="select select-bordered w-full md:w-auto"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | 'confirmed' | 'unconfirmed' | 'activated' | 'unactivated')
            }
          >
            <option value="all">All Users</option>
            <option value="confirmed">Confirmed</option>
            <option value="unconfirmed">Unconfirmed</option>
            <option value="activated">Activated</option>
            <option value="unactivated">Unactivated</option>
          </select>
        </div>

        {/* Page size selector */}
        <div>
          <select
            className="select select-bordered"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            aria-label="Number of entries per page"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="mb-2 text-sm">
        Showing {filteredUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
        {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} users
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="table w-full table-auto">
          <thead>
            <tr className="bg-base-200">
              <th className="cursor-pointer p-2 md:p-4" onClick={() => handleSort('username')}>
                Username {sortField === 'username' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="cursor-pointer p-2 md:p-4" onClick={() => handleSort('email')}>
                Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="hidden cursor-pointer p-2 sm:table-cell md:p-4" onClick={() => handleSort('name')}>
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="hidden cursor-pointer p-2 md:table-cell md:p-4" onClick={() => handleSort('createdAt')}>
                Created {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="hidden p-2 sm:table-cell md:p-4">Status</th>
              <th className="p-2 text-center md:p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-base-100/50 border-b">
                <td className="p-2 md:p-4">
                  <div className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap md:max-w-none">
                    {user.username}
                  </div>
                </td>
                <td className="p-2 md:p-4">
                  <div className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap md:max-w-none">
                    {user.email}
                  </div>
                </td>
                <td className="hidden p-2 sm:table-cell md:p-4">{user.name}</td>
                <td className="hidden p-2 md:table-cell md:p-4">{user.createdAt?.slice(0, 10)}</td>
                <td className="hidden p-2 sm:table-cell md:p-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="tooltip tooltip-top"
                      data-tip={user.profile?.confirmationDate ? 'Confirmed' : 'Unconfirmed'}
                    >
                      <div
                        className={`size-3 rounded-full ${user.profile?.confirmationDate ? 'bg-success' : 'bg-warning'}`}
                      ></div>
                    </div>
                    <div
                      className="tooltip tooltip-top"
                      data-tip={user.profile?.activationDate ? 'Activated' : 'Unactivated'}
                    >
                      <div
                        className={`size-3 rounded-full ${user.profile?.activationDate ? 'bg-success' : 'bg-warning'}`}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="p-2 text-center md:p-4">
                  <Link to="/admins/users/$userId" params={{ userId: user.id }} className="btn btn-xs btn-primary">
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <div className="btn-group">
            <button type="button" className="btn btn-sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              «
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ‹
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              const pageNum = i + 1
              return (
                <button
                  key={i}
                  type="button"
                  className={`btn btn-sm ${currentPage === pageNum ? 'btn-active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}

      {filteredUsers.length === 0 && (
        <div className="bg-base-200 mt-4 rounded-lg p-4 text-center">
          {searchTerm || statusFilter !== 'all' ? 'No users match your filters' : 'No users found'}
        </div>
      )}
    </div>
  )
}
