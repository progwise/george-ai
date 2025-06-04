import { z } from 'zod'

import { UserFragment } from '../../../../../gql/graphql'
import { Selector } from './selector'

interface UserSelectorProps {
  users: UserFragment[]
  onSelect: (user: UserFragment) => void
  onInvite: (email: string) => void
  disabled: boolean
}

const isEmail = (str: string) => z.string().email().safeParse(str).success

const INVITE_USER_ID = 'invite'

export const UserSelector = ({ users, onSelect, disabled, onInvite }: UserSelectorProps) => (
  <Selector
    options={(query) => {
      if (isEmail(query)) {
        return [
          ...users,
          {
            id: INVITE_USER_ID,
            name: `Invite ${query}`,
            username: query,
            email: query,
            createdAt: new Date().toISOString(),
            __typename: 'User',
          } satisfies UserFragment,
        ]
      }

      return users
    }}
    onSelect={(user) => {
      if (user.id === INVITE_USER_ID) {
        return onInvite(user.email)
      }
      onSelect(user)
    }}
    disabled={disabled}
    compareOption={(user, query) => (user.name + user.username).toLowerCase().includes(query.toLowerCase())}
    getKey={(user) => user.id}
    getLabel={(user) => user.name ?? user.username}
    notFoundLabel="No users found"
    inputPlaceholder="Search users or invite by email..."
  />
)
