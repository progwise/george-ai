import { AssistantAvatar_AiAssistantFragment, UserAvatar_UserFragment } from '../../../gql/graphql'
import { AssistantAvatar } from './assistant-avatar'
import { Avatar } from './avatar'
import { UserAvatar } from './user-avatar'

interface AvatarProps {
  avatars: (AssistantAvatar_AiAssistantFragment | UserAvatar_UserFragment)[]
  maxVisible?: number
}

export const AvatarGroup = ({ avatars, maxVisible = Infinity }: AvatarProps) => {
  const displayPlusX = avatars.length > maxVisible
  const maxDisplayedAvatars = displayPlusX ? maxVisible - 1 : maxVisible

  return (
    <div className="avatar-group -space-x-3">
      {avatars
        .slice(0, maxDisplayedAvatars)
        .map((avatar) =>
          avatar.__typename === 'AiAssistant' ? (
            <AssistantAvatar key={avatar.id} assistant={avatar} />
          ) : (
            <UserAvatar key={avatar.id} user={avatar} />
          ),
        )}
      {displayPlusX && (
        <Avatar id="" name={`+${avatars.length - maxDisplayedAvatars}`} maxPlaceholderLength={Infinity} />
      )}
    </div>
  )
}
