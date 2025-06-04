import { useCallback, useImperativeHandle, useRef } from 'react'

import { Avatar } from '../../../../../components/conversation/avatar/avatar'
import { UserAvatar } from '../../../../../components/conversation/avatar/user-avatar'
import { UserAvatar_UserFragment, UserFragment } from '../../../../../gql/graphql'
import { useTranslation } from '../../../../../i18n/use-translation-hook'
import { CrossIcon } from '../../../../../icons/cross-icon'
import { UserSelector } from './user-selector'

interface UserListProps {
  userId: string
  users: UserAvatar_UserFragment[]
  availableUsers: UserFragment[]
  emailInvites: string[]
  pendingEmailInvites: string[]
  disabled: boolean
  onAssign: (userId: string) => void
  onUnassign: (userId: string) => void
  onInvite: (data: { email: string; allowDifferentEmail: boolean; allowMultipleParticipants: boolean }) => void
  ref?: React.Ref<{ getEmailSettings: () => { allowDifferentEmail: boolean; allowMultipleParticipants: boolean } }>
}

export const UserList = ({
  userId,
  users,
  availableUsers,
  emailInvites,
  pendingEmailInvites,
  disabled,
  onAssign,
  onUnassign,
  onInvite,
  ref,
}: UserListProps) => {
  const { t } = useTranslation()

  const allowDifferentEmailCheckboxRef = useRef<HTMLInputElement>(null)
  const allowMultipleParticipantsCheckboxRef = useRef<HTMLInputElement>(null)

  const getEmailSettings = useCallback(
    () => ({
      allowDifferentEmail: allowDifferentEmailCheckboxRef.current?.checked ?? false,
      allowMultipleParticipants: allowMultipleParticipantsCheckboxRef.current?.checked ?? false,
    }),
    [],
  )

  useImperativeHandle(ref, () => ({ getEmailSettings }), [getEmailSettings])

  return (
    <>
      <ul className="list grow">
        {users.map((user) => (
          <li key={user.id} className="list-row">
            <UserAvatar user={user} />
            <div>{user.name || user.username}</div>

            {!disabled && user.id !== userId && (
              <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={() => onUnassign(user.id)}>
                <CrossIcon />
              </button>
            )}
          </li>
        ))}

        {emailInvites.map((email) => (
          <li key={email} className="list-row">
            <Avatar name={email} />
            <div>{email}</div>
          </li>
        ))}

        {pendingEmailInvites.map((email) => (
          <li key={email} className="list-row opacity-50">
            <Avatar name={email} />
            <div>{email}</div>
            <span className="loading loading-spinner loading-xs" />
          </li>
        ))}
      </ul>

      <div className="p-2">
        <UserSelector
          users={availableUsers}
          onSelect={(user) => onAssign(user.id)}
          onInvite={(email) =>
            onInvite({
              ...getEmailSettings(),
              email,
            })
          }
          disabled={disabled}
        />
        <fieldset className="fieldset mt-2 w-full p-2">
          <legend className="fieldset-legend">E-Mail invite options</legend>
          <label className="label">
            <input
              type="checkbox"
              defaultChecked
              className="checkbox checkbox-xs"
              ref={allowDifferentEmailCheckboxRef}
            />
            {t('texts.allowDifferentEmail')}
          </label>
          <label className="label">
            <input
              type="checkbox"
              defaultChecked
              className="checkbox checkbox-xs"
              ref={allowMultipleParticipantsCheckboxRef}
            />
            {t('texts.allowMultipleParticipants')}
          </label>
        </fieldset>
      </div>
    </>
  )
}
