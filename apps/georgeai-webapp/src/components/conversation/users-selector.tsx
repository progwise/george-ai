import { Dispatch, SetStateAction, useMemo, useState } from 'react'

import { UserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { UserAvatar } from '../user-avatar'

interface UsersSelectorProps {
  users: UserFragment[]
  selectedUserIds: string[]
  setSelectedUserIds: Dispatch<SetStateAction<string[]>>
  className?: string
}

export const UsersSelector = ({ users, selectedUserIds, setSelectedUserIds, className }: UsersSelectorProps) => {
  const { t } = useTranslation()
  const [userSearch, setUserSearch] = useState<string>('')

  const displayedUsers = useMemo(() => {
    const search = userSearch.toLowerCase()
    const list = users.filter((user) => {
      const isCurrentlySelected = selectedUserIds.includes(user.id)

      const isSearchMatching: boolean =
        user.username.toLowerCase().includes(search) ||
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.profile?.business?.toLowerCase().includes(search) ||
        user.profile?.position?.toLowerCase().includes(search) ||
        false

      return isCurrentlySelected || isSearchMatching
    })
    return list
  }, [users, userSearch, selectedUserIds])

  const showNoUsersFound = displayedUsers.length < 1
  const allDisplayedUserSelected = displayedUsers.length === selectedUserIds.length

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <input
        type="text"
        onChange={(event) => setUserSearch(event.currentTarget.value)}
        name="userSearch"
        placeholder={t('placeholders.searchUsers')}
        className="input input-sm w-full shrink-0"
      />
      {showNoUsersFound && <p className="text-sm">{t('texts.noUsersFound')}</p>}
      {displayedUsers.length > 0 && (
        <div className="flex flex-col gap-2 overflow-y-auto rounded-box border border-transparent p-2 hover:border-base-300">
          <label className="label text-base-content">
            <input
              type="checkbox"
              name="selectAll"
              className="checkbox checkbox-xs checkbox-info"
              checked={selectedUserIds.length > 0}
              ref={(element) => {
                if (!element) return
                element.indeterminate = selectedUserIds.length > 0 && !allDisplayedUserSelected
              }}
              onChange={() => {
                if (allDisplayedUserSelected) {
                  setSelectedUserIds([])
                } else {
                  setSelectedUserIds(displayedUsers.map((user) => user.id))
                }
              }}
            />
            <span className="text-sm">
              {displayedUsers.length} {t('texts.usersFound')}
            </span>
          </label>
          <div className="flex min-w-full flex-col gap-2 overflow-y-auto border-t border-base-300 py-2">
            {displayedUsers.map((user) => {
              const formattedUser = `${user.name} (${user.email}${user.profile?.business ? ' | ' + user.profile?.business : ''})`
              return (
                <label key={user.id} className="label">
                  <input
                    type="checkbox"
                    name="userIds"
                    value={user.id}
                    className="checkbox checkbox-xs checkbox-info"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={(event) => {
                      const value = event.target.checked
                      if (value) {
                        setSelectedUserIds((prev) => [...prev, user.id])
                      } else {
                        setSelectedUserIds((prev) => prev.filter((id) => id !== user.id))
                      }
                    }}
                  />
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <UserAvatar user={user} className="size-6 flex-none" />
                    <span className="truncate text-sm leading-tight" title={formattedUser}>
                      {formattedUser}
                    </span>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
