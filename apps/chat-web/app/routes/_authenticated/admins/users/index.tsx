import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { UserFilters } from '../../../../components/admins/users/user-filters'
import { UserStats } from '../../../../components/admins/users/user-stats'
import { UserTable } from '../../../../components/admins/users/user-table'
import { Pagination } from '../../../../components/table/pagination'
import { useTranslation } from '../../../../i18n/use-translation-hook'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { t } = useTranslation()

  const userStats = useMemo(() => {
    if (!data?.users) return { total: 0, confirmed: 0, unconfirmed: 0, activated: 0, unactivated: 0 }
    return data.users.reduce(
      (stats, user) => {
        stats.total++
        if (user.profile?.confirmationDate) stats.confirmed++
        else stats.unconfirmed++
        if (user.profile?.activationDate) stats.activated++
        else stats.unactivated++
        return stats
      },
      { total: 0, confirmed: 0, unconfirmed: 0, activated: 0, unactivated: 0 },
    )
  }, [data?.users])

  const filteredUsers = useMemo(() => {
    if (!data.users) return []
    return data.users.filter((user) => {
      const searchMatch =
        searchTerm === '' ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))

      let statusMatch = true
      if (statusFilter !== 'all') {
        if (statusFilter === 'confirmed') statusMatch = !!user.profile?.confirmationDate
        else if (statusFilter === 'unconfirmed') statusMatch = !user.profile?.confirmationDate
        else if (statusFilter === 'activated') statusMatch = !!user.profile?.activationDate
        else if (statusFilter === 'unactivated') statusMatch = !user.profile?.activationDate
      }
      return searchMatch && statusMatch
    })
  }, [data.users, searchTerm, statusFilter])

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredUsers.slice(startIndex, startIndex + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  const totalPages = Math.ceil(filteredUsers.length / pageSize)

  return (
    <div className="px-2 md:px-4">
      <div className="bg-base-100 sticky top-16 z-10 pb-4 pt-2">
        <h2 className="mb-4 text-lg font-bold">{t('labels.allUsers')}</h2>
        {/* Stats Cards */}
        <UserStats stats={userStats} />

        {/* Search and filters */}
        <UserFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />

        {/* Showing info and pagination */}
        <div className="mb-2 mt-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div className="text-sm">
            {t('texts.showingUsers', {
              start: filteredUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0,
              end: Math.min(currentPage * pageSize, filteredUsers.length),
              total: filteredUsers.length,
            })}
          </div>
          {totalPages > 1 && (
            <Pagination
              totalItems={filteredUsers.length}
              itemsPerPage={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* User Table */}
        <UserTable users={paginatedUsers} />

        {filteredUsers.length === 0 && (
          <div className="bg-base-200 mt-4 rounded-lg p-4 text-center">
            {searchTerm || statusFilter !== 'all' ? t('texts.noUsersMatchFilters') : t('texts.noUsersFound')}
          </div>
        )}
      </div>
    </div>
  )
}
