import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { UserFragment } from '../gql/graphql'
import UserIcon from '../icons/user-icon'
import { addCacheBustingToAvatarUrl } from './avatar-provider'

// Extend UserFragment to include avatarUrl until types are regenerated
type UserWithAvatar = UserFragment & { avatarUrl?: string | null }

interface UserAvatarProps {
  user: UserWithAvatar | Pick<UserWithAvatar, 'name' | 'avatarUrl'>
  className?: string
  showFallback?: boolean
}

export const UserAvatar = ({ user, className, showFallback = true }: UserAvatarProps) => {
  const [imageError, setImageError] = useState(false)
  const [lastAvatarUrl, setLastAvatarUrl] = useState(user.avatarUrl)

  // Apply cache busting to manually uploaded avatars
  const displayAvatarUrl = addCacheBustingToAvatarUrl(user.avatarUrl || null)

  // Reset image error when avatarUrl changes
  if (lastAvatarUrl !== user.avatarUrl) {
    setImageError(false)
    setLastAvatarUrl(user.avatarUrl)
  }

  const shouldShowImage = displayAvatarUrl && !imageError
  const shouldShowFallback = showFallback && (!displayAvatarUrl || imageError)

  if (shouldShowImage) {
    return (
      <div className={twMerge('avatar', className)}>
        <div className="border-base-content rounded-full border">
          <img
            src={displayAvatarUrl}
            alt={user.name || 'User avatar'}
            className="rounded-full object-cover"
            onError={() => {
              setImageError(true)
            }}
          />
        </div>
      </div>
    )
  }

  if (shouldShowFallback) {
    return (
      <div className={twMerge('avatar avatar-placeholder', className)}>
        <div className="bg-base-300 text-base-content border-base-content flex items-center justify-center rounded-full border">
          {user.name ? <span>{user.name.charAt(0).toUpperCase()}</span> : <UserIcon />}
        </div>
      </div>
    )
  }

  return null
}
