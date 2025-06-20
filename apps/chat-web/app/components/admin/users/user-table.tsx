import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { ManagedUserFragment, User } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { toastError } from '../../georgeToaster'
import { LoadingSpinner } from '../../loading-spinner'
import { toggleAdminStatus } from './toggle-admin-status'

export const UserTable = ({
  users,
  currentUser,
  onChange,
}: {
  users: ManagedUserFragment[]
  currentUser: User
  onChange: () => void
}) => {
  const { t } = useTranslation()

  const { mutate: toggleAdminStatusMutation, isPending } = useMutation({
    mutationFn: async (userId: string) => {
      await toggleAdminStatus({ data: { userId } })
    },
    onError: (error) => toastError(t('errors.toggleAdminStatusFailed', { error: error.message })),
    onSettled: () => {
      onChange()
    },
  })

  return (
    <div className="border-base-300 relative max-h-[65vh] overflow-auto rounded-lg border">
      {isPending && <LoadingSpinner />}
      <table className="table w-full table-auto">
        <thead className="bg-base-200 sticky top-0 z-10">
          <tr>
            <th className="cursor-pointer p-2 md:p-4">{t('labels.username')}</th>
            <th className="cursor-pointer p-2 md:p-4">{t('labels.email')}</th>
            <th className="hidden cursor-pointer p-2 sm:table-cell md:p-4">{t('labels.name')}</th>
            <th className="hidden cursor-pointer p-2 md:table-cell md:p-4">{t('labels.createdAt')}</th>
            <th className="hidden p-2 sm:table-cell md:p-4">{t('labels.status')}</th>
            <th className="p-2 text-center md:p-4">{t('labels.isAdmin')}</th>
            <th className="p-2 text-center md:p-4">{t('labels.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-base-100/50">
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
                    className="tooltip tooltip-left"
                    data-tip={user?.confirmationDate ? t('labels.confirmed') : t('labels.unconfirmed')}
                  >
                    <div
                      className={`size-3 rounded-full ${user?.confirmationDate ? 'bg-success' : 'bg-warning'}`}
                    ></div>
                  </div>
                  <div
                    className="tooltip tooltip-right"
                    data-tip={user?.activationDate ? t('labels.activated') : t('labels.unactivated')}
                  >
                    <div className={`size-3 rounded-full ${user?.activationDate ? 'bg-success' : 'bg-warning'}`}></div>
                  </div>
                </div>
              </td>
              <td className="p-2 text-center md:p-4">
                <input
                  type="checkbox"
                  defaultChecked={user.isAdmin}
                  disabled={user.id === currentUser.id}
                  aria-label="IsAdmin"
                  className="checkbox"
                  onClick={() => {
                    toggleAdminStatusMutation(user.id)
                  }}
                />
              </td>
              <td className="p-2 text-center md:p-4">
                <Link to="/admin/users/$userId" params={{ userId: user.id }} className="btn btn-xs btn-primary">
                  {t('actions.details')}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
