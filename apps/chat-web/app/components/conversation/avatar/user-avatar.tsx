import { graphql } from '../../../gql'
import { UserAvatar_UserFragment } from '../../../gql/graphql'
import { Avatar } from './avatar'

graphql(`
  fragment UserAvatar_User on User {
    id
    name
    username
    __typename
  }
`)

interface UserAvatarProps {
  user: UserAvatar_UserFragment
}

export const UserAvatar = ({ user: { id, name, username } }: UserAvatarProps) => {
  return <Avatar id={id} name={name ?? username} />
}
