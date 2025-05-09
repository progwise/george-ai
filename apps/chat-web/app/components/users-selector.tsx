import { Dispatch, SetStateAction, useMemo, useState } from 'react'

import { useTranslation } from '../i18n/use-translation-hook'
import { User } from '../server-functions/users'

interface UsersSelectorProps {
  users: User[]
  selectedUserIds: string[]
  setSelectedUserIds: Dispatch<SetStateAction<string[]>>
}

export const UsersSelector = ({ users, selectedUserIds, setSelectedUserIds }: UsersSelectorProps) => {
  const { t } = useTranslation()
  const [userSearch, setUserSearch] = useState<string>('')

  const displayedUsers = useMemo(() => {
    const search = userSearch.toLowerCase()
    const list = users.filter((user) => {
      const isCurrentlySelected = selectedUserIds.includes(user.id)

      // only search if the user has typed at least 2 characters
      const isSearchEnabled = userSearch.length >= 2
      const isSearchMatching: boolean =
        isSearchEnabled &&
        (user.username.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.profile?.firstName?.toLowerCase().includes(search) ||
          user.profile?.lastName?.toLowerCase().includes(search) ||
          user.profile?.business?.toLowerCase().includes(search) ||
          user.profile?.position?.toLowerCase().includes(search) ||
          false)

      return isCurrentlySelected || isSearchMatching
    })
    return list
  }, [users, userSearch, selectedUserIds])

  const allDisplayedUserSelected = displayedUsers.length === selectedUserIds.length

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        onChange={(event) => setUserSearch(event.currentTarget.value)}
        name="userSearch"
        placeholder={t('placeholders.searchUsers')}
        className="input"
      />
      <label className="label cursor-pointer justify-start gap-2">
        <input
          disabled={displayedUsers.length < 1}
          type="checkbox"
          name="selectAll"
          className="checkbox checkbox-primary checkbox-sm"
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

        {displayedUsers.length < 1 ? (
          <span className="info label-text font-bold">{t('texts.noUsersFound')}</span>
        ) : (
          <span className="info label-text font-bold">{`${displayedUsers.length} ${t('texts.usersFound')}`}</span>
        )}
      </label>

      <div className="h-48 w-full overflow-y-scroll">
        {displayedUsers.map((user) => (
          <label key={user.id} className="label cursor-pointer justify-start gap-2">
            <input
              type="checkbox"
              name="userIds"
              value={user.id}
              className="checkbox-info checkbox checkbox-sm"
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
            <span className="label-text truncate">
              {user.username} ({user.email}
              {user.profile?.business && ` | ${user.profile.business}`})
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
